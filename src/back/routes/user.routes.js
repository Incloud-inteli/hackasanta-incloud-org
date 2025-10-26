const express = require('express');
const createUserModel = require('../models/user.model.js');

function createUserRoutes() {
  const router = express.Router();
  const model = createUserModel();

  // Rota para CRIAR um novo usuário
  router.post('/', async (req, res) => {
    try {
      const user = await model.create(req.body);
      res.status(201).json({ 
        message: 'Usuário criado com sucesso!', 
        user 
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });

  // Rota para BUSCAR um usuário pelo ID do Supabase Auth
  router.get('/by-auth/:authId', async (req, res) => {
    try {
      const { authId } = req.params;
      let user = await model.findByAuthId(authId);
      if (!user) {
        user = await model.create({
          id: authId,
          nomeCompleto: 'Novo Usuário',
          cpf: '',
          telefone: ''
        });
      }
      // Buscar pacientes vinculados a este usuário
      const createPacienteModel = require('../models/paciente.model.js');
      const pacienteModel = createPacienteModel();
      const pacientes = await pacienteModel.findByAuthId(authId);
      // Retornar perfil + pacientes
      res.status(200).json({ ...user, pacientes });
    } catch (error) {
      console.error("Erro ao buscar/criar usuário por Auth ID:", error);
      res.status(500).json({ error: 'Erro ao buscar/criar usuário por Auth ID' });
    }
  });

  // Rota para BUSCAR um usuário pelo ID interno
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
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
  
  // Rota para LISTAR todos os usuários
  router.get('/', async (req, res) => {
    try {
      const users = await model.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  });

  // Rota para ATUALIZAR um usuário
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await model.update(id, req.body);
      if (user) {
        res.status(200).json({ 
          message: 'Usuário atualizado com sucesso',
          user
        });
      } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  });

  return router;
}

module.exports = createUserRoutes;