// front/src/services/pacienteService.js
import api from './api';

const pacienteService = {
  // Buscar todos os pacientes
  getAll: async () => {
    const response = await api.get('/pacientes');
    return response.data;
  },

  // Buscar paciente por ID
  getById: async (id) => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },

  // 🔍 Buscar paciente(s) por usuario_id (usuário logado)
  getByUserId: async (usuario_id) => {
    const response = await api.get(`/pacientes/by-user/${usuario_id}`);
    return response.data;
  },

  // Criar novo paciente
  create: async (pacienteData) => {
    const response = await api.post('/pacientes', pacienteData);
    return response.data;
  },

  // Atualizar paciente
  update: async (id, updateData) => {
    const response = await api.put(`/pacientes/${id}`, updateData);
    return response.data;
  },

  // Deletar paciente
  delete: async (id) => {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  }
};

export default pacienteService;