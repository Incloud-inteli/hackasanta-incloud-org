// back/models/alerta.model.js
const { supabase } = require('../services/supabaseClient');

function createAlertaModel() {
  return {
    // Busca todos os alertas de um paciente específico

    async getAllByPacienteId(pacienteId) {
      // Garante que pacienteId é numérico e definido
      const pacienteIdNum = Number(pacienteId);
      if (!pacienteId || isNaN(pacienteIdNum)) {
        throw new Error('ID do paciente inválido (deve ser numérico e definido)');
      }
      const { data, error } = await supabase
        .from('alertas')
        .select('*')
        .eq('paciente_id', pacienteIdNum)
        .order('data_hora_geracao', { ascending: false });

      if (error) throw error;
      return data;
    },

    // Busca todos os alertas (geral, pode ser útil para um dashboard administrativo)
    async getAll() {
      const { data, error } = await supabase
  .from('alertas')
        .select('*')
  .order('data_hora_geracao', { ascending: false });

      if (error) throw error;
      return data;
    },

    // Busca um único alerta pelo seu ID
    async getById(id) {
      const { data, error } = await supabase
  .from('alertas')
        .select('*')
        .eq('ID_Alerta', id)
        .single();

      if (error) throw error;
      return data;
    },

    // Cria um novo alerta
    async create(alertaData) {
      const novoAlerta = {
  paciente_id: alertaData.pacienteId,
        ID_Atendimento_Origem: alertaData.atendimentoId,
        Motivo: alertaData.motivo,
        NivelRisco: alertaData.nivelRisco,
        Status: alertaData.status,
  data_hora_geracao: new Date().toISOString()
      };

      const { data, error } = await supabase
  .from('alertas')
        .insert([novoAlerta])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Atualiza um alerta (ex: para mudar o status de 'Pendente' para 'Resolvido')
    async updateById(id, updateData) {
      const { data, error } = await supabase
        .from('alertas')
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