const express = require('express');
const { ObjectId } = require('mongodb');
const createPacienteModel = require('../models/paciente.model.js');

function createPacienteRoutes(db) {
  const router = express.Router();
  const pacienteModel = createPacienteModel(db);
  const pacienteCollection = db.collection('paciente');

  // Criar novo paciente
  router.post('/', async (req, res) => {
    try {
      const body = req.body;

      const fichaData = {
        userId: body.userId || null,
        responsaveis: body.responsaveis || [],
        dadosPessoais: body.dadosPessoais || {},
        historicoMedico: body.historicoMedico || {},
        historicoFamiliar: body.historicoFamiliar || {},
        contatosEmergencia: body.contatosEmergencia?.map(c => ({
          nome: c.nome || 'A preencher',
          telefone: c.telefone || 'A preencher'
        })) || [],
        prontuario: body.prontuario || { resumoGeralSaude: 'A preencher' },
        formType: body.formType || 'euMesmo',
        parentesco: body.parentesco || ''
      };

      const result = await pacienteCollection.insertOne(fichaData);
      res.status(201).json({ message: "Paciente criado com sucesso!", insertedId: result.insertedId });
    } catch (err) {
      console.error("Erro ao criar paciente:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Listar todos
  router.get('/', async (req, res) => {
    try {
      const pacientes = await pacienteModel.getAll();
      res.status(200).json(pacientes);
    } catch (err) {
      console.error("Erro ao listar pacientes:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Buscar pacientes por usuário
  router.get('/by-user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const pacienteDireto = await pacienteCollection.findOne({ userId });
      const pacientesComoResponsavel = await pacienteCollection
        .find({ 'responsaveis.userId': userId })
        .toArray();

      const pacientes = [];
      if (pacienteDireto) pacientes.push(pacienteDireto);
      pacientes.push(...pacientesComoResponsavel);

      if (pacientes.length === 0) {
        return res.status(404).json({ message: 'Nenhum paciente encontrado para este usuário.' });
      }

      res.status(200).json(pacientes);
    } catch (err) {
      console.error("Erro ao buscar pacientes por userId:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Buscar por ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const paciente = await pacienteModel.getById(id);
      if (paciente) {
        res.status(200).json(paciente);
      } else {
        res.status(404).json({ message: 'Paciente não encontrado.' });
      }
    } catch (err) {
      console.error("Erro ao buscar paciente por ID:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Atualizar paciente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }

      const body = req.body;
      const fichaData = {
        dadosPessoais: body.dadosPessoais || {},
        historicoMedico: body.historicoMedico || {},
        historicoFamiliar: body.historicoFamiliar || {},
        contatosEmergencia: body.contatosEmergencia?.map(c => ({
          nome: c.nome || 'A preencher',
          telefone: c.telefone || 'A preencher'
        })) || [],
        prontuario: body.prontuario || { resumoGeralSaude: 'A preencher' },
        formType: body.formType || 'euMesmo',
        parentesco: body.parentesco || ''
      };

      const result = await pacienteCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: fichaData }
      );

      if (result.matchedCount > 0) {
        res.status(200).json({ message: 'Paciente atualizado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Paciente não encontrado.' });
      }
    } catch (err) {
      console.error("Erro ao atualizar paciente:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Deletar paciente
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const result = await pacienteModel.deleteById(id);
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Paciente deletado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Paciente não encontrado.' });
      }
    } catch (err) {
      console.error("Erro ao deletar paciente:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createPacienteRoutes;