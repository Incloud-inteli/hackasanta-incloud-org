// front/src/services/prontuarioService.js
import api from './api';

const prontuarioService = {
  // Buscar todos os prontuários
  getAll: async () => {
    const response = await api.get('/prontuarios');
    return response.data;
  },

  // Buscar prontuário por ID
  getById: async (id) => {
    const response = await api.get(`/prontuarios/${id}`);
    return response.data;
  },

  // Criar novo prontuário
  create: async (prontuarioData) => {
    const response = await api.post('/prontuarios', prontuarioData);
    return response.data;
  },

  // Atualizar prontuário
  update: async (id, updateData) => {
    const response = await api.put(`/prontuarios/${id}`, updateData);
    return response.data;
  },

  // Deletar prontuário
  delete: async (id) => {
    const response = await api.delete(`/prontuarios/${id}`);
    return response.data;
  }
};

export default prontuarioService;