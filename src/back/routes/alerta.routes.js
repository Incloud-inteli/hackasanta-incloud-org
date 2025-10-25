const express = require('express');
const { ObjectId } = require('mongodb');
const createAlertaModel = require('../models/alerta.model.js');

function createAlertaRoutes(db) {
  const router = express.Router();
  const alertaModel = createAlertaModel(db);

  router.post('/', async (req, res) => {
    try {
      const result = await alertaModel.create(req.body);
      res.status(201).json({ message: "Alerta criado com sucesso!", insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const { pacienteId } = req.query;
      let alertas;

      if (pacienteId) {
        if (!ObjectId.isValid(pacienteId)) {
          return res.status(400).json({ message: 'ID de paciente inválido.' });
        }
        alertas = await alertaModel.getAllByPacienteId(pacienteId);
      } else {
        alertas = await alertaModel.getAll();
      }
      res.status(200).json(alertas);
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
      const alerta = await alertaModel.getById(id);
      if (alerta) {
        res.status(200).json(alerta);
      } else {
        res.status(404).json({ message: 'Alerta não encontrado.' });
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
      const result = await alertaModel.updateById(id, req.body);
      if (result.matchedCount > 0) {
        res.status(200).json({ message: 'Alerta atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Alerta não encontrado.' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createAlertaRoutes;