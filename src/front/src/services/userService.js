// front/src/services/userService.js
import api from './api';

const userService = {
  // Buscar todos os usuários
  getAll: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  // Buscar usuário por ID (incluindo pacientes vinculados)
  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}?include=pacientes`);
    return response.data;
  },

  // Criar novo usuário
  create: async (userData) => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },

  // Atualizar usuário
  update: async (id, updateData) => {
    const response = await api.put(`/usuarios/${id}`, updateData);
    return response.data;
  },

  // Deletar usuário
  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};

export default userService;