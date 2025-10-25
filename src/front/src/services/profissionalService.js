// front/src/services/profissionalService.js
import api from './api';

const profissionalService = {
  // Buscar todos os profissionais
  getAll: async () => {
    const response = await api.get('/profissionais');
    return response.data;
  },

  // Buscar profissional por ID
  getById: async (id) => {
    const response = await api.get(`/profissionais/${id}`);
    return response.data;
  },

  // Criar novo profissional
  create: async (profissionalData) => {
    const response = await api.post('/profissionais', profissionalData);
    return response.data;
  },

  // Atualizar profissional
  update: async (id, updateData) => {
    const response = await api.put(`/profissionais/${id}`, updateData);
    return response.data;
  },

  // Deletar profissional
  delete: async (id) => {
    const response = await api.delete(`/profissionais/${id}`);
    return response.data;
  }
};

export default profissionalService;