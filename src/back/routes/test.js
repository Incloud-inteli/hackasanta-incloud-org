const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Configuração básica do Supabase
const supabase = createClient(
  'https://tyqikmyzzmiygthufwej.supabase.co',
  'sb_secret_eOCNJ7N3Cg2ZvldS4Qo5Kg_usTycPTC',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Rota de teste
router.post('/test-signup', async (req, res) => {
  try {
    // 1. Primeiro, vamos tentar criar um usuário básico
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;