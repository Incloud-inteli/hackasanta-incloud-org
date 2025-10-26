const express = require('express');
const createPacienteModel = require('../models/paciente.model.js');
const { supabase } = require('../services/supabaseClient');

function createPacienteRoutes() {
  const router = express.Router();
  const pacienteModel = createPacienteModel();

  // Criar novo paciente
  router.post('/', async (req, res) => {
    try {
      const body = req.body;

      // Dados do paciente no novo formato do Supabase
      const pacienteData = {
        ID_UsuarioSistema: body.userId,
        NomeCompleto: body.dadosPessoais?.nomeCompleto || 'A preencher',
        DataNascimento: body.dadosPessoais?.dataNascimento,
        CPF: body.dadosPessoais?.cpf,
        Email: body.dadosPessoais?.email,
        CEP: body.dadosPessoais?.cep,
        TelefoneContato: body.dadosPessoais?.telefone,
        Genero: body.dadosPessoais?.genero,
        EnderecoCompleto: body.dadosPessoais?.endereco,
        EstadoCivil: body.dadosPessoais?.estadoCivil,
        Raca: body.dadosPessoais?.raca,
        Profissao: body.dadosPessoais?.profissao,
        TipoSanguineo: body.historicoMedico?.tipoSanguineo,
        CirurgiasPrevias: body.historicoMedico?.cirurgiasPrevias,
        Alergias: body.historicoMedico?.alergias,
        InternacoesPrevias: body.historicoMedico?.internacoesPrevias,
        DoencasCronicas: body.historicoMedico?.doencasCronicas,
        ProblemasNascimento: body.historicoMedico?.problemasNascimento,
        MedicamentosEmUso: body.historicoMedico?.medicamentosEmUso,
        TratamentosAtuais: body.historicoMedico?.tratamentosAtuais,
        HistoricoFamiliarCancer: body.historicoFamiliar?.historicoFamiliarCancer,
        HistoricoFamiliarTipoCancer: body.historicoFamiliar?.historicoFamiliarTipoCancer
      };

      const paciente = await pacienteModel.create(pacienteData);

      // Criar contatos de emergência
      if (body.contatosEmergencia && body.contatosEmergencia.length > 0) {
        const { data: contatos, error: contatosError } = await supabase
          .from('ContatosEmergencia')
          .insert(body.contatosEmergencia.map(c => ({
            ID_Paciente: paciente.ID_Paciente,
            Nome: c.nome,
            Telefone: c.telefone
          })));

        if (contatosError) throw contatosError;
      }

      // Criar prontuário
      if (body.prontuario) {
        const { data: prontuario, error: prontuarioError } = await supabase
          .from('Prontuarios')
          .insert({
            ID_Paciente: paciente.ID_Paciente,
            ResumoGeralSaude: body.prontuario.resumoGeralSaude || 'A preencher',
            DataUltimaAtualizacao: new Date().toISOString(),
            Versao: 1
          });

        if (prontuarioError) throw prontuarioError;
      }

      res.status(201).json({ 
        message: "Paciente criado com sucesso!", 
        paciente 
      });
    } catch (err) {
      console.error("Erro ao criar paciente:", err);
      res.status(500).json({ error: 'Erro ao criar paciente' });
    }
  });

  // Listar todos
  router.get('/', async (req, res) => {
    try {
      const pacientes = await pacienteModel.getAll();
      res.status(200).json(pacientes);
    } catch (err) {
      console.error("Erro ao listar pacientes:", err);
      res.status(500).json({ error: 'Erro ao listar pacientes' });
    }
  });

  // Buscar pacientes por usuário
  router.get('/by-user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const pacientes = await pacienteModel.findByAuthId(userId);

      if (pacientes.length === 0) {
        return res.status(404).json({ message: 'Nenhum paciente encontrado para este usuário.' });
      }

      res.status(200).json(pacientes);
    } catch (err) {
      console.error("Erro ao buscar pacientes por userId:", err);
      res.status(500).json({ error: 'Erro ao buscar pacientes do usuário' });
    }
  });

  // Buscar por ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const paciente = await pacienteModel.getById(id);
      
      if (paciente) {
        // Buscar contatos de emergência
        const { data: contatos } = await supabase
          .from('ContatosEmergencia')
          .select('*')
          .eq('ID_Paciente', id);

        // Buscar prontuário
        const { data: prontuario } = await supabase
          .from('Prontuarios')
          .select('*')
          .eq('ID_Paciente', id)
          .single();

        // Combinar todos os dados
        const pacienteCompleto = {
          ...paciente,
          contatosEmergencia: contatos || [],
          prontuario: prontuario || null
        };

        res.status(200).json(pacienteCompleto);
      } else {
        res.status(404).json({ message: 'Paciente não encontrado.' });
      }
    } catch (err) {
      console.error("Erro ao buscar paciente por ID:", err);
      res.status(500).json({ error: 'Erro ao buscar paciente' });
    }
  });

  // Atualizar paciente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;

      // Atualizar dados do paciente
      const paciente = await pacienteModel.updateById(id, {
        nomeCompleto: body.dadosPessoais?.nomeCompleto,
        dataNascimento: body.dadosPessoais?.dataNascimento,
        email: body.dadosPessoais?.email,
        cep: body.dadosPessoais?.cep,
        telefone: body.dadosPessoais?.telefone,
        genero: body.dadosPessoais?.genero,
        endereco: body.dadosPessoais?.endereco,
        estadoCivil: body.dadosPessoais?.estadoCivil,
        raca: body.dadosPessoais?.raca,
        profissao: body.dadosPessoais?.profissao,
        tipoSanguineo: body.historicoMedico?.tipoSanguineo,
        cirurgiasPrevias: body.historicoMedico?.cirurgiasPrevias,
        alergias: body.historicoMedico?.alergias,
        internacoesPrevias: body.historicoMedico?.internacoesPrevias,
        doencasCronicas: body.historicoMedico?.doencasCronicas,
        problemasNascimento: body.historicoMedico?.problemasNascimento,
        medicamentosEmUso: body.historicoMedico?.medicamentosEmUso,
        tratamentosAtuais: body.historicoMedico?.tratamentosAtuais,
        historicoFamiliarCancer: body.historicoFamiliar?.historicoFamiliarCancer,
        historicoFamiliarTipoCancer: body.historicoFamiliar?.historicoFamiliarTipoCancer
      });

      // Atualizar contatos de emergência
      if (body.contatosEmergencia) {
        // Primeiro remove todos os contatos existentes
        await supabase
          .from('ContatosEmergencia')
          .delete()
          .eq('ID_Paciente', id);

        // Depois insere os novos
        if (body.contatosEmergencia.length > 0) {
          await supabase
            .from('ContatosEmergencia')
            .insert(body.contatosEmergencia.map(c => ({
              ID_Paciente: id,
              Nome: c.nome,
              Telefone: c.telefone
            })));
        }
      }

      // Atualizar prontuário
      if (body.prontuario) {
        await supabase
          .from('Prontuarios')
          .upsert({
            ID_Paciente: id,
            ResumoGeralSaude: body.prontuario.resumoGeralSaude,
            DataUltimaAtualizacao: new Date().toISOString()
          });
      }

      res.status(200).json({ 
        message: 'Paciente atualizado com sucesso.',
        paciente
      });
    } catch (err) {
      console.error("Erro ao atualizar paciente:", err);
      res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
  });

  // Deletar paciente
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Primeiro deleta registros relacionados
      await Promise.all([
        supabase.from('ContatosEmergencia').delete().eq('ID_Paciente', id),
        supabase.from('Prontuarios').delete().eq('ID_Paciente', id),
        supabase.from('Paciente_Responsavel').delete().eq('ID_Paciente', id)
      ]);

      // Por fim, deleta o paciente
      const result = await pacienteModel.deleteById(id);

      if (result.success) {
        res.status(200).json({ message: 'Paciente e registros relacionados deletados com sucesso.' });
      } else {
        res.status(404).json({ message: 'Paciente não encontrado.' });
      }
    } catch (err) {
      console.error("Erro ao deletar paciente:", err);
      res.status(500).json({ error: 'Erro ao deletar paciente' });
    }
  });

  return router;
}

module.exports = createPacienteRoutes;