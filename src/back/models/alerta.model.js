// back/models/alerta.model.js
const { supabase } = require('../services/supabaseClient');

function createAlertaModel() {
  return {
    // Busca todos os alertas de um paciente específico
    async getAllByPacienteId(pacienteId) {
      const { data, error } = await supabase
        .from('Alertas')
        .select('*')
        .eq('ID_Paciente', pacienteId)
        .order('DataHoraGeracao', { ascending: false });

      if (error) throw error;
      return data;
    },

    // Busca todos os alertas (geral, pode ser útil para um dashboard administrativo)
    async getAll() {
      const { data, error } = await supabase
        .from('Alertas')
        .select('*')
        .order('DataHoraGeracao', { ascending: false });

      if (error) throw error;
      return data;
    },

    // Busca um único alerta pelo seu ID
    async getById(id) {
      const { data, error } = await supabase
        .from('Alertas')
        .select('*')
        .eq('ID_Alerta', id)
        .single();

      if (error) throw error;
      return data;
    },

    // Cria um novo alerta
    async create(alertaData) {
      const novoAlerta = {
        ID_Paciente: alertaData.pacienteId,
        ID_Atendimento_Origem: alertaData.atendimentoId,
        Motivo: alertaData.motivo,
        NivelRisco: alertaData.nivelRisco,
        Status: alertaData.status,
        DataHoraGeracao: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('Alertas')
        .insert([novoAlerta])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Atualiza um alerta (ex: para mudar o status de 'Pendente' para 'Resolvido')
    async updateById(id, updateData) {
      const { data, error } = await supabase
        .from('Alertas')
        .update({
          Status: updateData.status,
          NivelRisco: updateData.nivelRisco,
          Motivo: updateData.motivo
        })
        .eq('ID_Alerta', id)
        .select();

      if (error) throw error;
      return data;
    },
  };
}

module.exports = createAlertaModel;