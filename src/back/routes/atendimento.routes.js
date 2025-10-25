const express = require('express');
const createAtendimentoModel = require('../models/atendimento.model.js');

function createAtendimentoRoutes() {
  const router = express.Router();
  const model = createAtendimentoModel();

  // Rota para buscar atendimentos de um paciente
  router.get('/', async (req, res) => {
    try {
      const { pacienteId } = req.query;
      if (!pacienteId) {
        return res.status(400).json({ message: 'ID de paciente é obrigatório.' });
      }
      const atendimentos = await model.getAllByPacienteId(pacienteId);
      res.status(200).json(atendimentos);
    } catch (err) {
      console.error('Erro ao buscar atendimentos:', err);
      res.status(500).json({ error: 'Erro ao buscar atendimentos' });
    }
  });

  // Rota para buscar um atendimento específico
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const atendimento = await model.getById(id);
      if (atendimento) {
        res.status(200).json(atendimento);
      } else {
        res.status(404).json({ message: 'Atendimento não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao buscar atendimento:', err);
      res.status(500).json({ error: 'Erro ao buscar atendimento' });
    }
  });

  // Rota para criar um novo atendimento
  router.post('/', async (req, res) => {
    try {
      const atendimento = await model.create(req.body);
      res.status(201).json({ 
        message: "Atendimento criado com sucesso!", 
        atendimento 
      });
    } catch (err) {
      console.error('Erro ao criar atendimento:', err);
      res.status(500).json({ error: 'Erro ao criar atendimento' });
    }
  });

  // Rota para atualizar um atendimento
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const atendimento = await model.updateById(id, req.body);
      if (atendimento) {
        res.status(200).json({ 
          message: 'Atendimento atualizado com sucesso.',
          atendimento 
        });
      } else {
        res.status(404).json({ message: 'Atendimento não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao atualizar atendimento:', err);
      res.status(500).json({ error: 'Erro ao atualizar atendimento' });
    }
  });

  // Rota para deletar um atendimento
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await model.deleteById(id);
      if (result.success) {
        res.status(200).json({ message: 'Atendimento deletado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Atendimento não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao deletar atendimento:', err);
      res.status(500).json({ error: 'Erro ao deletar atendimento' });
    }
  });
  
  return router;
}

module.exports = createAtendimentoRoutes;