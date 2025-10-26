const express = require('express');
const createTranscritorModel = require('../models/transcritor.model.js');

function createTranscritorRoutes() {
  const router = express.Router();
  const model = createTranscritorModel();

  // Listar todas as transcrições
  router.get('/', async (req, res) => {
    try {
      const transcricoes = await model.getAll();
      res.status(200).json(transcricoes);
    } catch (err) {
      console.error('Erro ao listar transcrições:', err);
      res.status(500).json({ error: 'Erro ao listar transcrições' });
    }
  });

  // Buscar transcrição por ID
  router.get('/:id', async (req, res) => {
    try {
      const transcricao = await model.getById(req.params.id);
      if (transcricao) {
        res.status(200).json(transcricao);
      } else {
        res.status(404).json({ message: 'Transcrição não encontrada' });
      }
    } catch (err) {
      console.error('Erro ao buscar transcrição:', err);
      res.status(500).json({ error: 'Erro ao buscar transcrição' });
    }
  });

  // Criar nova transcrição
  router.post('/', async (req, res) => {
    try {
      const { atendimentoId, conteudo } = req.body;

      if (!atendimentoId || !conteudo) {
        return res.status(400).json({ 
          error: 'AtendimentoId e conteúdo são obrigatórios.' 
        });
      }

      const transcricao = await model.create({
        atendimentoId,
        conteudo
      });

      res.status(201).json({
        message: 'Transcrição criada com sucesso',
        transcricao
      });
    } catch (err) {
      console.error('Erro ao criar transcrição:', err);
      res.status(500).json({ error: 'Erro ao criar transcrição' });
    }
  });

  // Atualizar transcrição
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { conteudo } = req.body;

      if (!conteudo) {
        return res.status(400).json({ 
          error: 'O conteúdo é obrigatório.' 
        });
      }

      const transcricao = await model.update(id, { conteudo });
      
      if (transcricao) {
        res.status(200).json({
          message: 'Transcrição atualizada com sucesso',
          transcricao
        });
      } else {
        res.status(404).json({ message: 'Transcrição não encontrada' });
      }
    } catch (err) {
      console.error('Erro ao atualizar transcrição:', err);
      res.status(500).json({ error: 'Erro ao atualizar transcrição' });
    }
  });

  // Deletar transcrição
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await model.delete(id);
      
      if (result.success) {
        res.status(200).json({ message: 'Transcrição removida com sucesso' });
      } else {
        res.status(404).json({ message: 'Transcrição não encontrada' });
      }
    } catch (err) {
      console.error('Erro ao deletar transcrição:', err);
      res.status(500).json({ error: 'Erro ao deletar transcrição' });
    }
  });

  return router;
}

module.exports = createTranscritorRoutes;