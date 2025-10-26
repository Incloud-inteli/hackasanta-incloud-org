// back/models/atendimento.model.js
const { supabase } = require('../services/supabaseClient');

function createAtendimentoModel() {
  return {
    // Busca todos os atendimentos DE UM PACIENTE ESPECÍFICO
    async getAllByPacienteId(pacienteId) {
  // Garante que pacienteId é numérico
  const pacienteIdNum = Number(pacienteId);
  if (isNaN(pacienteIdNum)) throw new Error('ID do paciente inválido (deve ser numérico)');
  const { data, error } = await supabase
    .from('atendimentos')
    .select('*')
    .eq('paciente_id', pacienteIdNum)
    .order('data_hora_agendamento', { ascending: false });

      if (error) throw error;
      return data;
    },

    // Busca um único atendimento pelo seu ID
    async getById(id) {
  const { data, error } = await supabase
  .from('atendimentos')
    .select('*')
    .eq('id', id)
    .single();

      if (error) throw error;
      return data;
    },

    // Cria um novo atendimento
    async create(atendimentoData) {
      // Garante que pacienteId é numérico
      const pacienteIdNum = Number(atendimentoData.pacienteId);
      if (isNaN(pacienteIdNum)) throw new Error('ID do paciente inválido (deve ser numérico)');
      const novoAtendimento = {
        paciente_id: pacienteIdNum,
        data_hora_agendamento: new Date().toISOString(),
        tipo: atendimentoData.tipo,
        status: atendimentoData.status,
        observacoes: atendimentoData.observacoesProfissional
      };

      const { data, error } = await supabase
        .from('atendimentos')
        .insert([novoAtendimento])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Atualiza um atendimento
    async updateById(id, updateData) {
      const { data, error } = await supabase
        .from('atendimentos')
        .update({
          status: updateData.status,
          observacoes: updateData.observacoesProfissional,
          data_hora_realizacao: updateData.dataHoraRealizacao
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },

    // Deleta um atendimento pelo ID
    async deleteById(id) {
      const { error } = await supabase
        .from('atendimentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  };
}

module.exports = createAtendimentoModel;