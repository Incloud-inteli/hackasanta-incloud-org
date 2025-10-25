const express = require('express');
const createResponsavelModel = require('../models/responsavel.model.js');

function createResponsavelRoutes() {
  const router = express.Router();
  const responsavelModel = createResponsavelModel();

  // Criar novo responsável
  router.post('/', async (req, res) => {
    try {
      const responsavel = await responsavelModel.create(req.body);
      res.status(201).json({ 
        message: "Responsável criado com sucesso!", 
        responsavel 
      });
    } catch (err) {
      console.error('Erro ao criar responsável:', err);
      res.status(500).json({ error: 'Erro ao criar responsável' });
    }
  });

  // Vincular responsável a um paciente
  router.post('/vincular', async (req, res) => {
    try {
      const { responsavelId, pacienteId, parentesco } = req.body;
      
      if (!responsavelId || !pacienteId || !parentesco) {
        return res.status(400).json({ 
          error: 'ResponsavelId, pacienteId e parentesco são obrigatórios.' 
        });
      }

      const vinculo = await responsavelModel.vincularPaciente(
        responsavelId, 
        pacienteId, 
        parentesco
      );

      res.status(201).json({ 
        message: "Responsável vinculado com sucesso!", 
        vinculo 
      });
    } catch (err) {
      console.error('Erro ao vincular responsável:', err);
      res.status(500).json({ error: 'Erro ao vincular responsável' });
    }
  });

  // Listar todos os responsáveis
  router.get('/', async (req, res) => {
    try {
      const responsaveis = await responsavelModel.getAll();
      res.status(200).json(responsaveis);
    } catch (err) {
      console.error('Erro ao listar responsáveis:', err);
      res.status(500).json({ error: 'Erro ao listar responsáveis' });
    }
  });

  // Buscar responsável por ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const responsavel = await responsavelModel.getById(id);
      if (responsavel) {
        res.status(200).json(responsavel);
      } else {
        res.status(404).json({ message: 'Responsável não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao buscar responsável:', err);
      res.status(500).json({ error: 'Erro ao buscar responsável' });
    }
  });

  // Atualizar responsável
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const responsavel = await responsavelModel.updateById(id, req.body);
      if (responsavel) {
        res.status(200).json({ 
          message: 'Responsável atualizado com sucesso.',
          responsavel
        });
      } else {
        res.status(404).json({ message: 'Responsável não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao atualizar responsável:', err);
      res.status(500).json({ error: 'Erro ao atualizar responsável' });
    }
  });

  // Desvincular responsável de um paciente
  router.delete('/desvincular', async (req, res) => {
    try {
      const { responsavelId, pacienteId } = req.body;
      
      if (!responsavelId || !pacienteId) {
        return res.status(400).json({ 
          error: 'ResponsavelId e pacienteId são obrigatórios.' 
        });
      }

      const result = await responsavelModel.desvincularPaciente(
        responsavelId, 
        pacienteId
      );

      if (result.success) {
        res.status(200).json({ message: 'Vínculo removido com sucesso.' });
      } else {
        res.status(404).json({ message: 'Vínculo não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao desvincular responsável:', err);
      res.status(500).json({ error: 'Erro ao desvincular responsável' });
    }
  });

  // Deletar responsável
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await responsavelModel.deleteById(id);
      if (result.success) {
        res.status(200).json({ message: 'Responsável deletado com sucesso.' });
      } else {
        res.status(404).json({ message: 'Responsável não encontrado.' });
      }
    } catch (err) {
      console.error('Erro ao deletar responsável:', err);
      res.status(500).json({ error: 'Erro ao deletar responsável' });
    }
  });

  return router;
}

module.exports = createResponsavelRoutes;