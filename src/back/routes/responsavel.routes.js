const express = require('express');
const { ObjectId } = require('mongodb');
const createResponsavelModel = require('../models/responsavel.model.js');

function createResponsavelRoutes(db) {
  const router = express.Router();
  const responsavelModel = createResponsavelModel(db);

  router.post('/', async (req, res) => {
    try {
      const result = await responsavelModel.create(req.body);
      res.status(201).json({ message: "Responsável criado com sucesso!", insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const responsaveis = await responsavelModel.getAll();
      res.status(200).json(responsaveis);
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
      const responsavel = await responsavelModel.getById(id);
      if (responsavel) {
        res.status(200).json(responsavel);
      } else {
        res.status(404).json({ message: 'Responsável não encontrado.' });
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
      const result = await responsavelModel.updateById(id, req.body);
      if (result.matchedCount > 0) {
        res.status(200).json({ message: 'Responsável atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Responsável não encontrado.' });
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
      const result = await responsavelModel.deleteById(id);
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Responsável deletado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Responsável não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createResponsavelRoutes;