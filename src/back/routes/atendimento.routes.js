const express = require('express');
const { ObjectId } = require('mongodb');
const createAtendimentoModel = require('../models/atendimento.model.js');

function createAtendimentoRoutes(db) {
  const router = express.Router();
  const model = createAtendimentoModel(db);

  // Rota para buscar atendimentos de um paciente
  router.get('/', async (req, res) => {
    try {
      const { pacienteId } = req.query;
      if (!pacienteId || !ObjectId.isValid(pacienteId)) {
        return res.status(400).json({ message: 'ID de paciente inválido.' });
      }
      const atendimentos = await model.getAllByPacienteId(pacienteId);
      res.status(200).json(atendimentos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Rota para criar um novo atendimento
  router.post('/', async (req, res) => {
    try {
        const result = await model.create(req.body);
        res.status(201).json({ message: "Atendimento criado com sucesso!", insertedId: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });
  
  return router;
}

module.exports = createAtendimentoRoutes;