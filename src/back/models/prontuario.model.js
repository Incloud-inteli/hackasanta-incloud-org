const { supabase } = require('../services/supabaseClient');

function createProntuarioModel() {
  return {
    /**
     * Cria um novo documento de prontuário.
     */
    async create(prontuarioData) {
      console.log('Dados recebidos para criar prontuário:', JSON.stringify(prontuarioData, null, 2));
      
      const novoProntuario = {
        ID_Paciente: prontuarioData.pacienteId,
        ResumoGeralSaude: prontuarioData.resumoGeralSaude,
        DataUltimaAtualizacao: new Date().toISOString(),
        Versao: 1
      };

      console.log('Dados a serem inseridos no prontuário:', JSON.stringify(novoProntuario, null, 2));

        const { data, error } = await supabase
          .from('prontuarios')
          .insert([novoProntuario])
          .select()
          .single();

      if (error) {
        console.error('Erro detalhado ao inserir prontuário:', error);
        throw error;
      }
      
      console.log('Prontuário criado com sucesso:', data);
      return data;
    },

    /**
     * Busca um prontuário pelo ID do paciente associado.
     */
    async getByPacienteId(pacienteId) {
      const { data, error } = await supabase
        .from('prontuarios')
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
        .from('prontuarios')
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