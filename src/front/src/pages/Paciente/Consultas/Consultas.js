import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Phone, MessageCircle, Video, Mail } from 'lucide-react';
import './Consultas.css';

const Consultas = () => {
  const [activeTab, setActiveTab] = useState('agendamentos');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successText, setSuccessText] = useState('');
  const [meioContatoSelecionado, setMeioContatoSelecionado] = useState('Mensagem no Whatsapp');
  const [consultaConfirmada, setConsultaConfirmada] = useState(false);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');

  // Opções de meio de contato
  const meiosContato = [
    { id: 1, nome: 'Mensagem no Whatsapp', icon: MessageCircle },
    { id: 2, nome: 'Ligação Telefônica', icon: Phone },
    { id: 3, nome: 'Videochamada', icon: Video },
    { id: 4, nome: 'E-mail', icon: Mail },
  ];

  // Dados mock - depois pode vir da API
  const proximaConsulta = {
    data: '22/10/2025',
    hora: '14:00',
    tipo: 'Acompanhamento de Rotina',
    status: 'Confirmado',
    meioContato: meioContatoSelecionado,
  };

  const handleChangeMeioContato = (novoMeio) => {
    setMeioContatoSelecionado(novoMeio);
    setShowContactModal(false);
    // Aqui você pode adicionar chamada à API para salvar a alteração
    console.log('Meio de contato alterado para:', novoMeio);
  };

  // Função para obter o ícone correto baseado no meio de contato
  const getContactIcon = (meioContato) => {
    const meio = meiosContato.find(m => m.nome === meioContato);
    return meio ? meio.icon : MessageCircle;
  };

  const ContactIcon = getContactIcon(meioContatoSelecionado);

  // Função para confirmar consulta
  const handleConfirmarConsulta = () => {
    setConsultaConfirmada(true);
    setShowConfirmModal(false);
    showSuccess('Consulta confirmada com sucesso! ✓');
    // Aqui você pode adicionar chamada à API
    console.log('Consulta confirmada');
  };

  // Função para remarcar consulta
  const handleRemarcarConsulta = () => {
    if (!novaData || !novaHora) {
      alert('Por favor, preencha a data e hora');
      return;
    }
    setShowRescheduleModal(false);
    showSuccess(`Consulta remarcada para ${novaData} às ${novaHora}! ✓`);
    // Aqui você pode adicionar chamada à API
    console.log('Consulta remarcada para:', novaData, novaHora);
    setNovaData('');
    setNovaHora('');
  };

  // Função para cancelar consulta
  const handleCancelarConsulta = () => {
    setShowCancelModal(false);
    showSuccess('Consulta cancelada com sucesso.');
    // Aqui você pode adicionar chamada à API e redirecionar
    console.log('Consulta cancelada');
  };

  // Função para mostrar mensagem de sucesso
  const showSuccess = (message) => {
    setSuccessText(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const consultasPassadas = [
    {
      id: 1,
      titulo: 'Mensagem de Acompanhamento',
      data: '01/10/2025',
      hora: '08:30',
      duracao: '15 minutos',
      status: 'Concluída',
      tipo: 'mensagem',
      risco: 'médio',
    },
    {
      id: 2,
      titulo: 'Ligação de Acompanhamento',
      data: '27/09/2025',
      hora: '10:00',
      duracao: '15 minutos',
      status: 'Concluída',
      tipo: 'ligacao',
      risco: 'baixo',
    },
    {
      id: 3,
      titulo: 'Consulta inicial',
      data: '15/09/2025',
      hora: '10:00',
      duracao: '20 minutos',
      status: 'Concluída',
      tipo: 'presencial',
      risco: 'baixo',
    },
  ];

  return (
    <main className="consultas-page">
      <h1 className="consultas-title">Minhas Consultas</h1>

      {/* Mensagem de Sucesso */}
      {showSuccessMessage && (
        <div className="success-notification">
          <CheckCircle2 className="success-icon" />
          <span>{successText}</span>
        </div>
      )}

      {/* Modal de seleção de meio de contato */}
      {showContactModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowContactModal(false)} />
          <div className="contact-modal">
            <div className="modal-header">
              <h3 className="modal-title">Escolha o Meio de Contato</h3>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>
                <XCircle size={24} />
              </button>
            </div>
            <div className="contact-options">
              {meiosContato.map((meio) => {
                const Icon = meio.icon;
                const isSelected = meioContatoSelecionado === meio.nome;
                return (
                  <button
                    key={meio.id}
                    className={`contact-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleChangeMeioContato(meio.nome)}
                  >
                    <Icon size={24} className="contact-option-icon" />
                    <span className="contact-option-name">{meio.nome}</span>
                    {isSelected && <CheckCircle2 size={20} className="check-icon" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowConfirmModal(false)} />
          <div className="confirmation-modal">
            <div className="modal-header">
              <CheckCircle2 className="modal-icon success" size={48} />
            </div>
            <h3 className="modal-title-center">Confirmar Consulta</h3>
            <p className="modal-text">
              Tem certeza que deseja confirmar a consulta para <strong>{proximaConsulta.data} às {proximaConsulta.hora}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn-modal btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button className="btn-modal btn-primary" onClick={handleConfirmarConsulta}>
                Confirmar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Remarcar */}
      {showRescheduleModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)} />
          <div className="confirmation-modal">
            <div className="modal-header">
              <Calendar className="modal-icon info" size={48} />
            </div>
            <h3 className="modal-title-center">Remarcar Consulta</h3>
            <p className="modal-text">Escolha a nova data e hora para sua consulta:</p>
            <div className="form-group">
              <label className="form-label">Nova Data</label>
              <input
                type="date"
                className="form-input"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nova Hora</label>
              <input
                type="time"
                className="form-input"
                value={novaHora}
                onChange={(e) => setNovaHora(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-modal btn-secondary" onClick={() => setShowRescheduleModal(false)}>
                Cancelar
              </button>
              <button className="btn-modal btn-primary" onClick={handleRemarcarConsulta}>
                Remarcar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)} />
          <div className="confirmation-modal">
            <div className="modal-header">
              <XCircle className="modal-icon danger" size={48} />
            </div>
            <h3 className="modal-title-center">Cancelar Consulta</h3>
            <p className="modal-text">
              Tem certeza que deseja cancelar a consulta agendada para <strong>{proximaConsulta.data} às {proximaConsulta.hora}</strong>?
            </p>
            <p className="modal-warning">
              ⚠️ Esta ação não poderá ser desfeita.
            </p>
            <div className="modal-actions">
              <button className="btn-modal btn-secondary" onClick={() => setShowCancelModal(false)}>
                Voltar
              </button>
              <button className="btn-modal btn-danger" onClick={handleCancelarConsulta}>
                Cancelar Consulta
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'agendamentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('agendamentos')}
        >
          <Calendar className="tab-icon" />
          Agendamentos
        </button>
        <button
          className={`tab-button ${activeTab === 'historico' ? 'active' : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          <Clock className="tab-icon" />
          Histórico
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="tab-content">
        {activeTab === 'agendamentos' && (
          <div className="agendamentos-content">
            {/* Próximo Contato Agendado */}
            <div className="next-appointment-card">
              <div className="card-header">
                <h2 className="card-title">Próximo Contato Agendado</h2>
                <span className={`status-badge ${consultaConfirmada ? 'status-confirmed' : 'status-pending'}`}>
                  <CheckCircle2 className="badge-icon" />
                  {consultaConfirmada ? 'Confirmado' : proximaConsulta.status}
                </span>
              </div>

              <div className="appointment-details">
                <div className="detail-row">
                  <Calendar className="detail-icon" />
                  <div>
                    <span className="detail-label">Data e Hora</span>
                    <span className="detail-value">
                      {proximaConsulta.data} às {proximaConsulta.hora}
                    </span>
                  </div>
                </div>

                <div className="detail-row">
                  <AlertCircle className="detail-icon" />
                  <div>
                    <span className="detail-label">Tipo de Consulta</span>
                    <span className="detail-value">{proximaConsulta.tipo}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <ContactIcon className="detail-icon" />
                  <div>
                    <span className="detail-label">Meio de Contato</span>
                    <span className="detail-value">
                      {proximaConsulta.meioContato}
                      <button 
                        className="btn-link"
                        onClick={() => setShowContactModal(true)}
                      >
                        Mudar
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              <div className="appointment-actions">
                <button 
                  className="btn-action btn-confirm"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={consultaConfirmada}
                >
                  <CheckCircle2 className="btn-icon" />
                  {consultaConfirmada ? 'Já Confirmada' : 'Confirmar Consulta'}
                </button>
                <button 
                  className="btn-action btn-reschedule"
                  onClick={() => setShowRescheduleModal(true)}
                >
                  <Calendar className="btn-icon" />
                  Remarcar Consulta
                </button>
                <button 
                  className="btn-action btn-cancel"
                  onClick={() => setShowCancelModal(true)}
                >
                  <XCircle className="btn-icon" />
                  Cancelar Consulta
                </button>
              </div>
            </div>

            {/* Próximos Agendamentos */}
            <div className="section-header">
              <h2 className="section-title">Próximos Agendamentos</h2>
              <button className="btn-new-appointment">+ Nova Consulta</button>
            </div>

            <div className="empty-state">
              <Calendar className="empty-icon" />
              <p className="empty-text">Nenhum outro agendamento futuro</p>
              <button className="btn-action btn-reschedule">Agendar Nova Consulta</button>
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="historico-content">
            <div className="section-header">
              <h2 className="section-title">Histórico de Consultas</h2>
              <span className="total-count">{consultasPassadas.length} consultas realizadas</span>
            </div>

            <div className="consultas-list">
              {consultasPassadas.map((consulta) => (
                <div key={consulta.id} className="consulta-card">
                  <div className="consulta-header">
                    <div className="consulta-type-icon">
                      {consulta.tipo === 'mensagem' && <MessageCircle />}
                      {consulta.tipo === 'ligacao' && <Phone />}
                      {consulta.tipo === 'presencial' && <Calendar />}
                    </div>
                    <div className="consulta-info">
                      <h3 className="consulta-title">{consulta.titulo}</h3>
                      <div className="consulta-meta">
                        <Calendar className="meta-icon" />
                        <span>
                          {consulta.data} - {consulta.hora}
                        </span>
                        <span className="separator">•</span>
                        <Clock className="meta-icon" />
                        <span>Duração: {consulta.duracao}</span>
                      </div>
                    </div>
                  </div>

                  <div className="consulta-footer">
                    <span className={`risk-badge risk-${consulta.risco}`}>
                      Risco {consulta.risco}
                    </span>
                    <span className="status-badge status-completed">
                      <CheckCircle2 className="badge-icon" />
                      {consulta.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Consultas;
