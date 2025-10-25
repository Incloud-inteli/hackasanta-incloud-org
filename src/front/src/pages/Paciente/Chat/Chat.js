import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendMessage, isServiceConfigured } from '../../../services/chatService';
import './Chat.css';

const CHAT_STORAGE_KEY = 'previvai_chat_history';
const CHAT_TIMESTAMP_KEY = 'previvai_chat_timestamp';
const EXPIRATION_TIME = 60 * 60 * 1000; 

const loadChatHistory = () => {
  try {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!savedMessages) {
      return null;
    }
    return JSON.parse(savedMessages);
  } catch (error) {
    console.error('Erro ao carregar histórico do chat:', error);
    return null;
  }
};

const saveChatHistory = (messages) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Erro ao salvar histórico do chat:', error);
  }
};

const Chat = () => {
  const [message, setMessage] = useState('');
  
  const initialMessages = loadChatHistory() || [
    {
      id: 1,
      text: 'Olá! Sou o PREVIVAI, seu assistente médico virtual especializado em prevenção e detecção precoce de câncer. Como posso ajudá-lo hoje?',
      sender: 'ai',
    },
  ];
  
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]); 
  const [showClearModal, setShowClearModal] = useState(false); 
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    const updateTimestamp = () => {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        localStorage.setItem(CHAT_TIMESTAMP_KEY, Date.now().toString());
      }
    };

    window.addEventListener('click', updateTimestamp);
    window.addEventListener('keypress', updateTimestamp);

    return () => {
      window.removeEventListener('click', updateTimestamp);
      window.removeEventListener('keypress', updateTimestamp);
    };
  }, []);

  useEffect(() => {
    if (!isServiceConfigured()) {
      setError('⚠️ Serviço de chat não configurado. Configure sua chave de API no arquivo .env');
    }
  }, []);

  const processAppointment = (responseText) => {
    const appointmentRegex = /\[AGENDAMENTO\]([\s\S]*?)\[\/AGENDAMENTO\]/;
    const match = responseText.match(appointmentRegex);
    
    if (match) {
      const appointmentData = match[1];
      const lines = appointmentData.trim().split('\n');
      const appointment = {};
      
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim();
          appointment[key.trim()] = value;
        }
      });
      
      appointment.id = Date.now();
      appointment.status = 'Pendente';
      appointment.createdAt = new Date().toISOString();
      
      setAppointments(prev => [...prev, appointment]);
      
      const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      savedAppointments.push(appointment);
      localStorage.setItem('appointments', JSON.stringify(savedAppointments));
      
      console.log('📅 Agendamento registrado:', appointment);
      
      return responseText.replace(appointmentRegex, '').trim();
    }
    
    return responseText;
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory = [...messages, userMessage];
      const aiResponse = await sendMessage(conversationHistory);

      const processedResponse = processAppointment(aiResponse);

      const aiMessage = {
        id: Date.now() + 1,
        text: processedResponse,
        sender: 'ai',
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err.message || 'Erro ao processar sua mensagem. Tente novamente.');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: '😔 Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes.',
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setShowClearModal(true);
  };

  const confirmClearHistory = () => {
    const defaultMessage = {
      id: 1,
      text: 'Olá! Sou o PREVIVAI, seu assistente médico virtual especializado em prevenção e detecção precoce de câncer. Como posso ajudá-lo hoje?',
      sender: 'ai',
    };
    
    setMessages([defaultMessage]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CHAT_TIMESTAMP_KEY);
    setShowClearModal(false);
  };

  const cancelClearHistory = () => {
    setShowClearModal(false);
  };

  const isChatRestored = loadChatHistory() !== null;

  return (
    <main className="chat-page">
      <div className="chat-header-wrapper">
        <h1 className="chat-title">Conversa com o Agente de IA</h1>
        <button onClick={handleClearHistory} className="clear-history-btn" title="Limpar histórico">
          🗑️ Limpar Chat
        </button>
      </div>

      {/* Banner de restauração removido, histórico agora é permanente */}

      {error && (
        <div className="chat-error-banner">
          {error}
        </div>
      )}

      {/* Notificação de agendamentos */}
      {appointments.length > 0 && (
        <div className="chat-success-banner">
          📅 {appointments.length} agendamento(s) registrado(s). Nossa equipe entrará em contato em breve!
        </div>
      )}

      <div className="chat-container">
        {/* Messages Area */}
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender === 'user' ? 'message-end' : 'message-start'}`}>
              <div className={`message-bubble ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}>
                {msg.sender === 'ai' ? (
                  <ReactMarkdown
                    components={{
                      // Customizar renderização de elementos
                      p: ({node, ...props}) => <p style={{margin: '0.5em 0'}} {...props} />,
                      ul: ({node, ...props}) => <ul style={{marginLeft: '1.2em', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                      ol: ({node, ...props}) => <ol style={{marginLeft: '1.2em', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                      li: ({node, ...props}) => <li style={{marginBottom: '0.3em'}} {...props} />,
                      strong: ({node, ...props}) => <strong style={{fontWeight: '700', color: '#1f2937'}} {...props} />,
                      em: ({node, ...props}) => <em style={{fontStyle: 'italic'}} {...props} />,
                      h1: ({node, ...props}) => <h1 style={{fontSize: '1.4em', fontWeight: '700', margin: '0.5em 0'}} {...props} />,
                      h2: ({node, ...props}) => <h2 style={{fontSize: '1.2em', fontWeight: '700', margin: '0.5em 0'}} {...props} />,
                      h3: ({node, ...props}) => <h3 style={{fontSize: '1.1em', fontWeight: '700', margin: '0.5em 0'}} {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          
          {/* Indicador de digitação */}
          {isLoading && (
            <div className="message-wrapper message-start">
              <div className="message-bubble message-ai typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            className="chat-send-button"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showClearModal && (
        <div className="modal-overlay" onClick={cancelClearHistory}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              🗑️
            </div>
            <h2 className="modal-title">Limpar Histórico do Chat?</h2>
            <p className="modal-message">
              Esta ação irá remover todas as mensagens da conversa atual. 
              Você não poderá desfazer essa ação.
            </p>
            <div className="modal-actions">
              <button 
                onClick={cancelClearHistory} 
                className="modal-btn modal-btn-cancel"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmClearHistory} 
                className="modal-btn modal-btn-confirm"
              >
                Sim, Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Chat;
