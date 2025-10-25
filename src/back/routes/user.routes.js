const express = require('express');
const { ObjectId } = require('mongodb');
const createUserModel = require('../models/user.model.js');

function createUserRoutes(db) {
  const router = express.Router();
  const model = createUserModel(db);

  // Rota para CRIAR um novo usuário
  router.post('/', async (req, res) => {
    try {
      const result = await model.create(req.body);
      res.status(201).json({ message: 'Usuário criado com sucesso!', id: result.insertedId });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });

  // --- ROTA ESSENCIAL ADICIONADA ---
  // Rota para BUSCAR um usuário pelo ID de autenticação do Supabase
  router.get('/by-supabase/:supabaseUserId', async (req, res) => {
    try {
      const { supabaseUserId } = req.params;
      const user = await model.findBySupabaseId(supabaseUserId);
      
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error("Erro ao buscar usuário por ID Supabase:", error);
      res.status(500).json({ error: 'Erro ao buscar usuário por ID Supabase' });
    }
  });

  // Rota para BUSCAR um usuário pelo ID do MongoDB
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido.' });
      }
      const user = await model.getById(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  });
  
  // Rota para LISTAR todos os usuários (opcional, mas pode ser útil)
  router.get('/', async (req, res) => {
    try {
      const users = await model.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  });

  return router;
}

module.exports = createUserRoutes;