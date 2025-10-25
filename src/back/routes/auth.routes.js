const express = require('express');
// Assumindo que seus outros arquivos também usam 'require'
const { supabase } = require('../services/supabaseClient.js'); 
const { authenticate } = require('../middleware/authMiddleware.js');

function createAuthRoutes(db) { // Envelopado na função fábrica
  const router = express.Router();

  // 🧾 Registro de usuário
  router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: 'Usuário criado com sucesso.', user: data.user });
  });

  // 🔑 Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    res.json({
      message: 'Login realizado com sucesso.',
      token: data.session.access_token,
      user: data.user
    });
  });

  // 👤 Rota protegida
  router.get('/profile', authenticate, async (req, res) => {
    // A função 'authenticate' (middleware) roda antes disto.
    // Se o token for válido, ela coloca o 'user' no 'req'.
    res.json({ message: 'Acesso autorizado.', user: req.user });
  });

  return router;
}

module.exports = createAuthRoutes;