// front/src/services/alertaService.js
import api from './api';

const alertaService = {
  // Buscar todos os alertas
  getAll: async () => {
    const response = await api.get('/alertas');
    return response.data;
  },

  // Buscar alertas de um paciente
  getByPacienteId: async (pacienteId) => {
    const response = await api.get(`/alertas?pacienteId=${pacienteId}`);
    return response.data;
  },

  // Buscar alerta por ID
  getById: async (id) => {
    const response = await api.get(`/alertas/${id}`);
    return response.data;
  },

  // Criar novo alerta
  create: async (alertaData) => {
    const response = await api.post('/alertas', alertaData);
    return response.data;
  },

  // Atualizar alerta (ex: mudar status)
  update: async (id, updateData) => {
    const response = await api.put(`/alertas/${id}`, updateData);
    return response.data;
  }
};

export default alertaService;