const express = require('express');
// Assumindo que seus outros arquivos também usam 'require'
const { supabase } = require('../services/supabaseClient.js'); 
const { authenticate } = require('../middleware/authMiddleware.js');

function createAuthRoutes(db) { // Envelopado na função fábrica
  const router = express.Router();

  // Função para validar CPF (apenas 11 dígitos para testes)
  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return /^\d{11}$/.test(cpf);
  }

  // 🧾 Registro de usuário (feito no backend com Service Role Key)
  router.post('/register', async (req, res) => {
    console.log('[DEBUG] Recebendo requisição de registro:', {
      ...req.body,
      password: '***' // Ocultando a senha no log
    });

    const { email, password, nomeCompleto, cpf, telefone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

    // Validação de CPF (apenas 11 dígitos para testes)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!validarCPF(cpfLimpo)) {
      return res.status(400).json({ error: 'CPF deve conter 11 dígitos numéricos.' });
    }

    try {
      console.log('[DEBUG] Iniciando criação do usuário no Supabase');
      // Tenta criar o usuário via API administrativa (evita limitações de RLS)
      let createResult;

      console.log('[DEBUG] Verificando método disponível para criação de usuário');
      
      console.log('[DEBUG] Tentando criar usuário com signUp');
      createResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nomeCompleto: nomeCompleto, // Exatamente como está no trigger
            cpf: cpf,
            telefone: telefone
          }
        }
      });
      
      console.log('[DEBUG] Resultado da criação:', {
        error: createResult.error ? 'Sim' : 'Não',
        user: createResult.data?.user ? 'Presente' : 'Ausente'
      });

      if (createResult.error) {
        console.error('[DEBUG] Erro na criação do usuário:', createResult.error);
        return res.status(400).json({ error: createResult.error.message || createResult.error });
      }

      const createdUser = createResult.data?.user || createResult.user;
      if (!createdUser) return res.status(500).json({ error: 'Usuário criado mas dados retornados incompletos.' });

      console.log('[DEBUG] Preparando para inserir perfil do usuário');
      // Insere um registro de perfil na tabela `perfis`
      const profile = {
        id: createdUser.id,
        nome_completo: nomeCompleto,
        cpf: cpf, // Mantém o CPF com formatação (pontos e hífen)
        telefone: telefone // Mantém o telefone com formatação
        // created_at será preenchido automaticamente pelo PostgreSQL
      };
      
      console.log('[DEBUG] Dados do perfil a serem inseridos:', {
        ...profile,
        SenhaHash: '***' // Ocultando senha no log
      });

      const { data: profileData, error: profileError } = await supabase
        .from('perfis')
        .insert([profile])
        .select()
        .single();

      if (profileError) {
        console.error('[DEBUG] Erro ao criar perfil:', profileError);
        // Caso a criação do perfil falhe, tentamos remover o usuário criado para manter consistência
        try {
          if (createdUser && createdUser.id && supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.deleteUser === 'function') {
            console.log('[DEBUG] Tentando remover usuário após falha no perfil');
            await supabase.auth.admin.deleteUser(createdUser.id);
          }
        } catch (cleanupErr) {
          console.error('[DEBUG] Erro ao tentar remover usuário após falha no profile:', cleanupErr);
        }

        return res.status(500).json({ error: 'Erro ao salvar perfil do usuário: ' + profileError.message });
      }

      res.status(201).json({ message: 'Usuário criado com sucesso.', user: createdUser, profile: profileData });
    } catch (err) {
      console.error('Erro no registro de usuário:', err);
      return res.status(500).json({ error: 'Erro interno ao criar usuário.' });
    }
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