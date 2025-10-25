const express = require('express');
const { ObjectId } = require('mongodb');
const createProfissionalModel = require('../models/profissional.model.js');

function createProfissionalRoutes(db) {
  const router = express.Router();
  const profissionalModel = createProfissionalModel(db);

  router.post('/', async (req, res) => {
    try {
      const result = await profissionalModel.create(req.body);
      res.status(201).json({ message: "Profissional criado com sucesso!", insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const profissionais = await profissionalModel.getAll();
      res.status(200).json(profissionais);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const profissional = await profissionalModel.getById(id);
      if (profissional) {
        res.status(200).json(profissional);
      } else {
        res.status(404).json({ message: 'Profissional não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const result = await profissionalModel.updateById(id, req.body);
      if (result.matchedCount > 0) {
        res.status(200).json({ message: 'Profissional atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Profissional não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const result = await profissionalModel.deleteById(id);
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Profissional deletado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Profissional não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createProfissionalRoutes;