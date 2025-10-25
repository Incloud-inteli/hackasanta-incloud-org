const express = require('express');
const { ObjectId } = require('mongodb');
const createProntuarioModel = require('../models/prontuario.model.js');

function createProntuarioRoutes(db) {
  const router = express.Router();
  const model = createProntuarioModel(db);

  /**
   * Rota para buscar um prontuário pelo ID do paciente.
   * Exemplo: GET /api/prontuarios?pacienteId=SEU_ID_DE_PACIENTE
   */
  router.get('/', async (req, res) => {
    try {
      const { pacienteId } = req.query;
      if (!pacienteId || !ObjectId.isValid(pacienteId)) {
        return res.status(400).json({ error: 'O parâmetro "pacienteId" é obrigatório e precisa ser um ID válido.' });
      }
      const prontuario = await model.getByPacienteId(pacienteId);
      prontuario
        ? res.status(200).json(prontuario)
        : res.status(404).json({ message: 'Prontuário não encontrado para este paciente.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Rota para criar um novo prontuário.
   */
  router.post('/', async (req, res) => {
    try {
      const { pacienteId, resumoGeralSaude, dataUltimaAtualizacao, versao } = req.body;

      if (!pacienteId || !ObjectId.isValid(pacienteId)) {
        return res.status(400).json({ error: 'O campo "pacienteId" é obrigatório e precisa ser um ID válido.' });
      }

      // Garante que os dados estão nos tipos corretos antes de salvar
      const novoProntuario = {
        pacienteId: new ObjectId(pacienteId),
        resumoGeralSaude: resumoGeralSaude || 'A preencher',
        dataUltimaAtualizacao: dataUltimaAtualizacao ? new Date(dataUltimaAtualizacao) : new Date(),
        versao: versao || 1
      };

      const result = await model.create(novoProntuario);
      res.status(201).json({ message: "Prontuário criado com sucesso!", insertedId: result.insertedId });
    } catch (err) {
      console.error('Erro ao criar prontuário:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Rota para atualizar um prontuário pelo seu _id.
   */
  router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID de prontuário inválido."});
        }
        
        const updateData = {};
        if (req.body.resumoGeralSaude) {
            updateData.resumoGeralSaude = req.body.resumoGeralSaude;
        }
        // Sempre atualiza a data da última modificação para o momento atual
        updateData.dataUltimaAtualizacao = new Date();
        if (req.body.versao) {
            updateData.versao = req.body.versao;
        }

        const atualizado = await model.update(id, updateData);

        atualizado
            ? res.json({ message: 'Prontuário atualizado com sucesso' })
            : res.status(404).json({ message: 'Prontuário não encontrado' });
    } catch (err) {
        console.error('Erro ao atualizar prontuário:', err);
        res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createProntuarioRoutes;