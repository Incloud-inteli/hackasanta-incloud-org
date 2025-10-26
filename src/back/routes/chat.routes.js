const express = require('express');
const router = express.Router();
const {
  createChatSession,
  listChatSessions,
  getChatHistory,
  updateChatHistory,
  deleteChatSession,
} = require('../services/chatHistoryService');

// Cria nova sessão de chat
router.post('/session', async (req, res) => {
  try {
    const { paciente_id, historico } = req.body;
    const session = await createChatSession(paciente_id, historico || []);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lista sessões do paciente
router.get('/sessions/:paciente_id', async (req, res) => {
  try {
    const { paciente_id } = req.params;
    const sessions = await listChatSessions(paciente_id);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Busca histórico de uma sessão
router.get('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const historico = await getChatHistory(id);
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualiza histórico de uma sessão
router.put('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { historico } = req.body;
    const updated = await updateChatHistory(id, historico);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deleta uma sessão de chat
router.delete('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteChatSession(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
