// back/models/user.model.js

const { supabase } = require('../services/supabaseClient');

function createUserModel() {
  return {

    // Cria um novo perfil de usuário no sistema
    async create(userData) {
      const novoPerfil = {
        id: userData.id, // UUID do auth
        nome_completo: userData.nomeCompleto,
        cpf: userData.cpf,
        telefone: userData.telefone
      };

      const { data, error } = await supabase
        .from('perfis')
        .insert([novoPerfil])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Busca um perfil pelo ID do Supabase Auth
    async findByAuthId(authId) {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', authId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignora erro de não encontrado
      return data;
    },

    // Busca um usuário pelo ID interno
    async getById(id) {
      const { data, error } = await supabase
        .from('UsuariosSistema')
        .select('*')
        .eq('ID_UsuarioSistema', id)
        .single();

      if (error) throw error;
      return data;
    },
    
    // Busca todos os usuários
    async getAll() {
      const { data, error } = await supabase
        .from('UsuariosSistema')
        .select('*');

      if (error) throw error;
      return data;
    },

    // Atualiza um usuário
    async update(id, updateData) {
      const { data, error } = await supabase
        .from('UsuariosSistema')
        .update({
          Email: updateData.email,
          NomeCompleto: updateData.nomeCompleto,
          Telefone: updateData.telefone
        })
        .eq('ID_UsuarioSistema', id)
        .select();

      if (error) throw error;
      return data;
    }
  };
}

module.exports = createUserModel;