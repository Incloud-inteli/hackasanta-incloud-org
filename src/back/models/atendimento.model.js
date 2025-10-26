// back/models/atendimento.model.js
const { supabase } = require('../services/supabaseClient');

function createAtendimentoModel() {
  return {
    // Busca todos os atendimentos DE UM PACIENTE ESPECÍFICO
    async getAllByPacienteId(pacienteId) {
      const { data, error } = await supabase
        .from('Atendimentos')
        .select('*')
        .eq('ID_Paciente', pacienteId)
        .order('DataHoraAgendamento', { ascending: false });

      if (error) throw error;
      return data;
    },

    // Busca um único atendimento pelo seu ID
    async getById(id) {
      const { data, error } = await supabase
        .from('Atendimentos')
        .select('*')
        .eq('ID_Atendimento', id)
        .single();

      if (error) throw error;
      return data;
    },

    // Cria um novo atendimento
    async create(atendimentoData) {
      const novoAtendimento = {
        ID_Paciente: atendimentoData.pacienteId,
        DataHoraAgendamento: new Date().toISOString(),
        Tipo: atendimentoData.tipo,
        Status: atendimentoData.status,
        ObservacoesProfissional: atendimentoData.observacoesProfissional
      };

      const { data, error } = await supabase
        .from('Atendimentos')
        .insert([novoAtendimento])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Atualiza um atendimento
    async updateById(id, updateData) {
      const { data, error } = await supabase
        .from('Atendimentos')
        .update({
          Status: updateData.status,
          ObservacoesProfissional: updateData.observacoesProfissional,
          DataHoraRealizacao: updateData.dataHoraRealizacao
        })
        .eq('ID_Atendimento', id)
        .select();

      if (error) throw error;
      return data;
    },

    // Deleta um atendimento pelo ID
    async deleteById(id) {
      const { error } = await supabase
        .from('Atendimentos')
        .delete()
        .eq('ID_Atendimento', id);

      if (error) throw error;
      return { success: true };
    },
  };
}

module.exports = createAtendimentoModel;