const express = require('express');
const createAlertaModel = require('../models/alerta.model.js');

function createAlertaRoutes() {
  const router = express.Router();
  const alertaModel = createAlertaModel();

  router.post('/', async (req, res) => {
    try {
      const alerta = await alertaModel.create(req.body);
      res.status(201).json({ message: "Alerta criado com sucesso!", alerta });
    } catch (err) {
      console.error('Erro ao criar alerta:', err);
      res.status(500).json({ error: 'Erro ao criar alerta' });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const { pacienteId } = req.query;
      let alertas;

      if (pacienteId) {
        // Não precisa mais validar ObjectId, pois o Supabase usa UUID ou números inteiros
        alertas = await alertaModel.getAllByPacienteId(pacienteId);
      } else {
        alertas = await alertaModel.getAll();
      }
      res.status(200).json(alertas);
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
      res.status(500).json({ error: 'Erro ao buscar alertas' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const alerta = await alertaModel.getById(id);
      if (alerta) {
        res.status(200).json(alerta);
      } else {
        res.status(404).json({ message: 'Alerta não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao buscar alerta:', err);
      res.status(500).json({ error: 'Erro ao buscar alerta' });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const alerta = await alertaModel.updateById(id, req.body);
      if (alerta) {
        res.status(200).json({ message: 'Alerta atualizado com sucesso.', alerta });
      } else {
        res.status(404).json({ message: 'Alerta não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao atualizar alerta:', err);
      res.status(500).json({ error: 'Erro ao atualizar alerta' });
    }
  });

  return router;
}

module.exports = createAlertaRoutes;