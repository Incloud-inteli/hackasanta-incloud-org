const { supabase } = require('../services/supabaseClient');

function createProntuarioModel() {
  return {
    /**
     * Cria um novo documento de prontuário.
     */
    async create(prontuarioData) {
      const novoProntuario = {
        ID_Paciente: prontuarioData.pacienteId,
        ResumoGeralSaude: prontuarioData.resumoGeralSaude,
        DataUltimaAtualizacao: new Date().toISOString(),
        Versao: 1
      };

      const { data, error } = await supabase
        .from('Prontuarios')
        .insert([novoProntuario])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Busca um prontuário pelo ID do paciente associado.
     */
    async getByPacienteId(pacienteId) {
      const { data, error } = await supabase
        .from('Prontuarios')
        .select('*')
        .eq('ID_Paciente', pacienteId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignora erro de não encontrado
      return data;
    },

    /**
     * Atualiza um prontuário pelo seu ID.
     */
    async update(id, updateData) {
      const { data, error } = await supabase
        .from('Prontuarios')
        .update({
          ResumoGeralSaude: updateData.resumoGeralSaude,
          DataUltimaAtualizacao: new Date().toISOString(),
          Versao: supabase.rpc('increment_version', { row_id: id })
        })
        .eq('ID_Prontuario', id)
        .select();

      if (error) throw error;
      return data;
    },
  };
}

module.exports = createProntuarioModel;