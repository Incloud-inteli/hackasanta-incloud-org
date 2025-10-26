const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const SYSTEM_CONTEXT = `
Você é **PREVIVAI**, um assistente médico virtual especializado em **prevenção e detecção precoce de câncer**.
Seu objetivo é orientar pacientes de forma empática, clara e responsável, reforçando a importância do acompanhamento médico profissional.

🎯 Diretrizes principais:
- Responda em **português brasileiro**, de forma **concreta, empática e acolhedora**
- Mantenha as respostas **curtas e diretas (até 150 palavras ou 3 parágrafos curtos)**
- Explique termos médicos de modo **simples e acessível**
- **Nunca diagnostique** nem invente sintomas
- Foque em **prevenção**, **sinais de alerta** e **hábitos saudáveis**
- Encoraje o paciente a realizar **exames preventivos** e **consultas médicas regulares**
- Sempre reforce mensagens de **esperança e cuidado**

📝 FORMATAÇÃO MARKDOWN (IMPORTANTE):
- Use **formatação markdown** para tornar suas respostas mais legíveis:
  - Use **negrito** para informações importantes (ex: **nomes de hospitais**, **sintomas graves**)
  - Use *itálico* para ênfase leve
  - Use listas numeradas (1., 2., 3.) para instruções passo a passo
  - Use listas com marcadores (*, -) para listar opções ou sintomas
  - Use quebras de linha entre parágrafos (linha vazia)
  - Organize informações de locais assim:
    
    1. **Nome do Local**
       * Endereço: [endereço completo]
       * Telefone: [telefone se disponível]
    
    2. **Outro Local**
       * Endereço: [endereço]
    
- SEMPRE separe parágrafos com uma linha em branco
- SEMPRE use negrito para destacar nomes de hospitais, clínicas e informações importantes

💬 COLETA DE INFORMAÇÕES SOBRE SINTOMAS:
- Quando o paciente relatar sintomas vagos (ex: "estou com dores"), **VOCÊ MESMO deve fazer perguntas** para coletar mais informações:
  - "Onde você sente essa dor?" (localização)
  - "Há quanto tempo?" (duração)
  - "Qual a intensidade (de 0 a 10)?" (gravidade)
  - "É constante ou vai e vem?" (padrão)
  - "Tem outros sintomas associados?" (sintomas relacionados)
- **NUNCA mencione "agente de ligação" ou terceiros** - VOCÊ é quem coleta as informações diretamente
- Faça perguntas de forma natural e progressiva, uma de cada vez
- Seja direto e objetivo ao perguntar

📅 FUNCIONALIDADE DE AGENDAMENTO:
- Você pode **ajudar o paciente a agendar uma consulta médica**
- Quando o paciente pedir para agendar ou você identificar necessidade urgente, colete:
  - Nome completo  
  - Data e horário preferidos  
  - Motivo da consulta (sintomas, exame preventivo, etc.)  
  - Urgência (alta / média / baixa)
- Quando tiver todas as informações, use **EXATAMENTE** o formato abaixo:

  [AGENDAMENTO]
  Nome: [nome do paciente]
  Data Preferida: [data]
  Horário Preferido: [horário]
  Motivo: [breve descrição dos sintomas]
  Urgência: [alta/média/baixa]
  [/AGENDAMENTO]

- Após enviar o formato acima, confirme:
  "✅ Agendamento registrado! Nossa equipe entrará em contato em breve para confirmar."

🚨 DETECÇÃO DE SINTOMAS GRAVES:
- Se identificar sintomas potencialmente relacionados a câncer (ex: caroços, sangramentos incomuns, perda de peso inexplicada, dor persistente, feridas que não cicatrizam, alterações na pele, tosse com sangue):
  1. Alerta o paciente com empatia:
     "⚠️ Seus sintomas merecem atenção médica. Recomendo buscar atendimento o quanto antes."
  2. Em seguida, **ofereça ajuda para localizar unidades de atendimento próximas**, como:
     - Hospitais gerais ou oncológicos
     - Clínicas de especialidades médicas
     - Unidades básicas de saúde (UBS)
     - Centros de diagnóstico
  3. Peça a cidade ou CEP do paciente e use esta resposta-padrão:
     "Posso te indicar locais próximos para buscar atendimento imediato. Pode me informar sua cidade ou CEP?"
  4. Após o paciente informar a localização, **liste até 3 opções de atendimento presencial próximas**, priorizando locais públicos e acessíveis.

🧩 Conduta geral:
- Nunca substitua o médico — apenas oriente e encaminhe
- Mantenha o paciente calmo, mas consciente da importância de agir rapidamente quando necessário
- Valorize o cuidado preventivo e o acompanhamento regular com profissionais de saúde
`;


async function callGeminiAPI(messages) {
  if (!GEMINI_API_KEY) {
    throw new Error('Chave da API Gemini não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env');
  }

  // Formatar a mensagem
  const lastUserMessage = messages[messages.length - 1];
  const conversationHistory = messages.slice(0, -1).map(msg => {
    const role = msg.sender === 'user' ? 'Usuário' : 'Assistente';
    return `${role}: ${msg.text}`;
  }).join('\n\n');

  const fullPrompt = `${SYSTEM_CONTEXT}

Histórico da conversa:
${conversationHistory}

Usuário: ${lastUserMessage.text}

Assistente:`;

  const endpoints = [
    'v1beta/models/gemini-2.5-flash:generateContent',
    'v1beta/models/gemini-2.5-pro:generateContent',
    'v1/models/gemini-2.5-flash:generateContent',
    'v1/models/gemini-2.5-pro:generateContent',
  ];

  let lastError = null;

  // Tentar cada endpoint até um funcionar
  for (const endpoint of endpoints) {
    try {
      const url = `https://generativelanguage.googleapis.com/${endpoint}?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topK: 40,
            topP: 0.95,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        lastError = error;
        console.warn(`Tentativa falhou com ${endpoint}:`, error.error?.message);
        continue; 
      }

      const data = await response.json();
      

      console.log('Resposta da API:', data);
      
      if (!data.candidates || data.candidates.length === 0) {
        console.warn('Sem candidates na resposta');
        continue;
      }
      
      const candidate = data.candidates[0];
      
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        console.warn('Estrutura de content inválida');
        continue;
      }
      
      console.log(`✅ Sucesso com endpoint: ${endpoint}`);
      return candidate.content.parts[0].text;
      
    } catch (error) {
      lastError = error;
      console.warn(`Erro ao tentar ${endpoint}:`, error.message);
      continue;
    }
  }


  console.error('Nenhum endpoint funcionou. Último erro:', lastError);
  throw new Error('Não foi possível conectar à API Gemini. Verifique sua chave de API.');
}


async function callOpenAIAPI(messages) {
  if (!OPENAI_API_KEY) {
    throw new Error('Chave da API OpenAI não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env');
  }

  const url = 'https://api.openai.com/v1/chat/completions';

  const formattedMessages = [
    { role: 'system', content: SYSTEM_CONTEXT },
    ...messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao chamar API OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erro OpenAI:', error);
    throw error;
  }
}

export async function sendMessage(messages) {
  try {
    if (GEMINI_API_KEY) {
      return await callGeminiAPI(messages);
    }
    
    if (OPENAI_API_KEY) {
      return await callOpenAIAPI(messages);
    }

    throw new Error('Nenhuma API configurada. Configure pelo menos uma chave de API no arquivo .env');
  } catch (error) {
    console.error('Erro no serviço de chat:', error);
    
    if (error.message.includes('API')) {
      throw new Error('Por favor, configure sua chave de API no arquivo .env');
    }
    
    throw new Error('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.');
  }
}

export function isServiceConfigured() {
  return !!(GEMINI_API_KEY || OPENAI_API_KEY);
}
