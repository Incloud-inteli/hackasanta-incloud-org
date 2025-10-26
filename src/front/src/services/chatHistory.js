import api from './api';

// Cria nova sessão de chat
export async function createChatSession(paciente_id, historico = []) {
  const { data } = await api.post('/chat/session', { paciente_id, historico });
  return data;
}

// Lista sessões do paciente
export async function listChatSessions(paciente_id) {
  const { data } = await api.get(`/chat/sessions/${paciente_id}`);
  return data;
}

// Busca histórico de uma sessão
export async function getChatHistory(session_id) {
  const { data } = await api.get(`/chat/session/${session_id}`);
  return data;
}

// Atualiza histórico de uma sessão
export async function updateChatHistory(session_id, historico) {
  const { data } = await api.put(`/chat/session/${session_id}`, { historico });
  return data;
}

// Remove uma sessão de chat
export async function deleteChatSession(session_id) {
  await api.delete(`/chat/session/${session_id}`);
}
