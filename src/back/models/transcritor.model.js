const { supabase } = require('../services/supabaseClient');

function createTranscritorModel() {
  return {
    async getAll() {
      const { data, error } = await supabase
        .from('Transcritores')
        .select('*');

      if (error) throw error;
      return data;
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('Transcritores')
        .select('*')
        .eq('ID_Transcricao', id)
        .single();

      if (error) throw error;
      return data;
    },

    async create(transcritor) {
      const novaTranscricao = {
        ID_Atendimento: transcritor.atendimentoId,
        Conteudo: transcritor.conteudo,
        DataHoraRegistro: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('Transcritores')
        .insert([novaTranscricao])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id, updateData) {
      const { data, error } = await supabase
        .from('Transcritores')
        .update({
          Conteudo: updateData.conteudo,
          DataHoraRegistro: new Date().toISOString()
        })
        .eq('ID_Transcricao', id)
        .select();

      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('Transcritores')
        .delete()
        .eq('ID_Transcricao', id);

      if (error) throw error;
      return { success: true };
    }
  };
}

module.exports = createTranscritorModel;