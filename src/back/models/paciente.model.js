const { supabase } = require('../services/supabaseClient');

function createPacienteModel() {
  return {
    async create(pacienteData) {
      const novoPaciente = {
        ID_UsuarioSistema: pacienteData.userId,
        NomeCompleto: pacienteData.nomeCompleto,
        DataNascimento: pacienteData.dataNascimento,
        CPF: pacienteData.cpf,
        Email: pacienteData.email,
        CEP: pacienteData.cep,
        TelefoneContato: pacienteData.telefone,
        Genero: pacienteData.genero,
        EnderecoCompleto: pacienteData.endereco,
        EstadoCivil: pacienteData.estadoCivil,
        Raca: pacienteData.raca,
        Profissao: pacienteData.profissao,
        TipoSanguineo: pacienteData.tipoSanguineo,
        CirurgiasPrevias: pacienteData.cirurgiasPrevias,
        Alergias: pacienteData.alergias,
        InternacoesPrevias: pacienteData.internacoesPrevias,
        DoencasCronicas: pacienteData.doencasCronicas,
        ProblemasNascimento: pacienteData.problemasNascimento,
        MedicamentosEmUso: pacienteData.medicamentosEmUso,
        TratamentosAtuais: pacienteData.tratamentosAtuais,
        HistoricoFamiliarCancer: pacienteData.historicoFamiliarCancer,
        HistoricoFamiliarTipoCancer: pacienteData.historicoFamiliarTipoCancer,
        DataCadastro: new Date().toISOString()
      };

      const { data, error } = await supabase
  .from('pacientes')
        .insert([novoPaciente])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getAll() {
      const { data, error } = await supabase
  .from('pacientes')
        .select('*');

      if (error) throw error;
      return data;
    },
    
    async findByAuthId(userId) {
      // Busca pacientes diretos (onde o usuário é o próprio paciente)
      const { data: pacienteDireto, error: errorPaciente } = await supabase
  .from('pacientes')
        .select('*')
        .eq('ID_UsuarioSistema', userId);

      if (errorPaciente) {
        console.error('Erro ao buscar paciente direto:', errorPaciente);
        throw errorPaciente;
      }

      // Busca pacientes onde o usuário é responsável
      const { data: responsaveis, error: errorResponsaveis } = await supabase
        .from('paciente_responsavel')
        .select(`
          *,
          pacientes (*)
        `)
        .eq('ID_Responsavel', userId);

      if (errorResponsaveis) {
        console.error('Erro ao buscar pacientes como responsável:', errorResponsaveis);
        throw errorResponsaveis;
      }

      // Debug: logar dados intermediários
      console.log('pacienteDireto:', pacienteDireto);
      console.log('responsaveis:', responsaveis);

      // Combina os resultados
      const pacientes = [
        ...(pacienteDireto || []),
        ...(responsaveis?.map(r => r.pacientes) || [])
      ];

      // Remove duplicatas
      const pacientesUnicos = [...new Map(pacientes.map(item => [item.ID_Paciente, item])).values()];
      console.log('pacientesUnicos:', pacientesUnicos);
      return pacientesUnicos;
    },

    async getById(id) {
      const { data, error } = await supabase
  .from('pacientes')
        .select('*')
        .eq('ID_Paciente', id)
        .single();

      if (error) throw error;
      return data;
    },

    async updateById(id, updateData) {
      const { data, error } = await supabase
  .from('pacientes')
        .update({
          NomeCompleto: updateData.nomeCompleto,
          DataNascimento: updateData.dataNascimento,
          Email: updateData.email,
          CEP: updateData.cep,
          TelefoneContato: updateData.telefone,
          Genero: updateData.genero,
          EnderecoCompleto: updateData.endereco,
          EstadoCivil: updateData.estadoCivil,
          Raca: updateData.raca,
          Profissao: updateData.profissao,
          TipoSanguineo: updateData.tipoSanguineo,
          CirurgiasPrevias: updateData.cirurgiasPrevias,
          Alergias: updateData.alergias,
          InternacoesPrevias: updateData.internacoesPrevias,
          DoencasCronicas: updateData.doencasCronicas,
          ProblemasNascimento: updateData.problemasNascimento,
          MedicamentosEmUso: updateData.medicamentosEmUso,
          TratamentosAtuais: updateData.tratamentosAtuais,
          HistoricoFamiliarCancer: updateData.historicoFamiliarCancer,
          HistoricoFamiliarTipoCancer: updateData.historicoFamiliarTipoCancer
        })
        .eq('ID_Paciente', id)
        .select();

      if (error) throw error;
      return data;
    },

    async deleteById(id) {
      const { error } = await supabase
  .from('pacientes')
        .delete()
        .eq('ID_Paciente', id);

      if (error) throw error;
      return { success: true };
    },
  };
}

module.exports = createPacienteModel;