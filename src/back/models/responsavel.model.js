// back/models/responsavel.model.js
const { supabase } = require('../services/supabaseClient');

function createResponsavelModel() {
  return {
    // Busca todos os responsáveis
    async getAll() {
      const { data, error } = await supabase
        .from('Responsaveis')
        .select('*');

      if (error) throw error;
      return data;
    },

    // Busca um único responsável pelo seu ID
    async getById(id) {
      const { data, error } = await supabase
        .from('Responsaveis')
        .select('*')
        .eq('ID_Responsavel', id)
        .single();

      if (error) throw error;
      return data;
    },

    // Cria um novo responsável
    async create(responsavelData) {
      const novoResponsavel = {
        ID_UsuarioSistema: responsavelData.userId,
        NomeCompleto: responsavelData.nomeCompleto,
        TelefoneContato: responsavelData.telefone,
        Email: responsavelData.email
      };

      const { data, error } = await supabase
        .from('Responsaveis')
        .insert([novoResponsavel])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Vincula um responsável a um paciente
    async vincularPaciente(responsavelId, pacienteId, parentesco) {
      const { data, error } = await supabase
        .from('paciente_responsavel')
        .insert([{
          ID_Paciente: pacienteId,
          ID_Responsavel: responsavelId,
          Parentesco: parentesco
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Atualiza um responsável pelo ID
    async updateById(id, updateData) {
      const { data, error } = await supabase
        .from('Responsaveis')
        .update({
          NomeCompleto: updateData.nomeCompleto,
          TelefoneContato: updateData.telefone,
          Email: updateData.email
        })
        .eq('ID_Responsavel', id)
        .select();

      if (error) throw error;
      return data;
    },

    // Deleta um responsável pelo ID
    async deleteById(id) {
      const { error } = await supabase
        .from('Responsaveis')
        .delete()
        .eq('ID_Responsavel', id);

      if (error) throw error;
      return { success: true };
    },

    // Remove vínculo entre responsável e paciente
    async desvincularPaciente(responsavelId, pacienteId) {
      const { error } = await supabase
        .from('paciente_responsavel')
        .delete()
        .match({
          ID_Paciente: pacienteId,
          ID_Responsavel: responsavelId
        });

      if (error) throw error;
      return { success: true };
    }
  };
}

module.exports = createResponsavelModel;