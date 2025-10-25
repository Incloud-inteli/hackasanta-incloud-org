const express = require('express');
const createTranscritorModel = require('../models/transcritor.model.js');

// Padronizando para a mesma sintaxe de função "fábrica"
function createTranscritorRoutes(db) {
  const router = express.Router();
  const model = createTranscritorModel(db);

  router.get('/', async (req, res) => {
    try {
      res.json(await model.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const result = await model.getById(req.params.id);
      result ? res.json(result) : res.status(404).json({ message: 'Transcritor não encontrado' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const novo = await model.create(req.body);
      res.status(201).json(novo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const atualizado = await model.update(req.params.id, req.body);
      atualizado
        ? res.json({ message: 'Transcritor atualizado com sucesso' })
        : res.status(404).json({ message: 'Transcritor não encontrado' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const removido = await model.delete(req.params.id);
      removido
        ? res.json({ message: 'Transcritor removido com sucesso' })
        : res.status(404).json({ message: 'Transcritor não encontrado' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createTranscritorRoutes;