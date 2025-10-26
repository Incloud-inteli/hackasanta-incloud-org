const express = require('express');
const createProntuarioModel = require('../models/prontuario.model.js');

function createProntuarioRoutes() {
  const router = express.Router();
  const model = createProntuarioModel();

  /**
   * Rota para buscar um prontuário pelo ID do paciente.
   * Exemplo: GET /api/prontuarios?pacienteId=SEU_ID_DE_PACIENTE
   */
  router.get('/', async (req, res) => {
    try {
      const { pacienteId } = req.query;
      if (!pacienteId) {
        return res.status(400).json({ error: 'O parâmetro "pacienteId" é obrigatório.' });
      }
      const prontuario = await model.getByPacienteId(pacienteId);
      prontuario
        ? res.status(200).json(prontuario)
        : res.status(404).json({ message: 'Prontuário não encontrado para este paciente.' });
    } catch (err) {
      console.error('Erro ao buscar prontuário:', err);
      res.status(500).json({ error: 'Erro ao buscar prontuário' });
    }
  });

  /**
   * Rota para criar um novo prontuário.
   */
  router.post('/', async (req, res) => {
    try {
      const { pacienteId, resumoGeralSaude } = req.body;

      if (!pacienteId) {
        return res.status(400).json({ error: 'O campo "pacienteId" é obrigatório.' });
      }

      const prontuario = await model.create({
        pacienteId,
        resumoGeralSaude: resumoGeralSaude || 'A preencher'
      });

      res.status(201).json({ 
        message: "Prontuário criado com sucesso!", 
        prontuario 
      });
    } catch (err) {
      console.error('Erro ao criar prontuário:', err);
      res.status(500).json({ error: 'Erro ao criar prontuário' });
    }
  });

  /**
   * Rota para atualizar um prontuário pelo seu ID.
   */
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { resumoGeralSaude } = req.body;

      if (!resumoGeralSaude) {
        return res.status(400).json({ error: 'O campo "resumoGeralSaude" é obrigatório.' });
      }

      const prontuario = await model.update(id, {
        resumoGeralSaude
      });

      if (prontuario) {
        res.status(200).json({ 
          message: 'Prontuário atualizado com sucesso',
          prontuario
        });
      } else {
        res.status(404).json({ message: 'Prontuário não encontrado' });
      }
    } catch (err) {
      console.error('Erro ao atualizar prontuário:', err);
      res.status(500).json({ error: 'Erro ao atualizar prontuário' });
    }
  });

  return router;
}

module.exports = createProntuarioRoutes;