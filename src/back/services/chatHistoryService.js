const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Cria nova sessão de chat
async function createChatSession(paciente_id, historico = []) {
  const { data, error } = await supabase
    .from('historico_chat')
    .insert([
      { paciente_id, historico: JSON.stringify(historico) }
    ])
    .select();
  if (error) throw error;
  return data[0];
}

// Lista sessões do paciente
async function listChatSessions(paciente_id) {
  const { data, error } = await supabase
    .from('historico_chat')
    .select('id, created_at')
    .eq('paciente_id', paciente_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Busca histórico de uma sessão
async function getChatHistory(session_id) {
  const { data, error } = await supabase
    .from('historico_chat')
    .select('historico')
    .eq('id', session_id)
    .single();
  if (error) throw error;
  return JSON.parse(data.historico);
}

// Atualiza histórico de uma sessão
async function updateChatHistory(session_id, historico) {
  const { data, error } = await supabase
    .from('historico_chat')
    .update({ historico: JSON.stringify(historico) })
    .eq('id', session_id)
    .select();
  if (error) throw error;
  return data[0];
}

module.exports = {
  createChatSession,
  listChatSessions,
  getChatHistory,
  updateChatHistory,
};
