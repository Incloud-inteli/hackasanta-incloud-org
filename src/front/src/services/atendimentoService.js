// front/src/services/atendimentoService.js
import api from './api';

const atendimentoService = {
  // Buscar atendimentos de um paciente
  getByPacienteId: async (pacienteId) => {
    const response = await api.get(`/atendimentos?pacienteId=${pacienteId}`);
    return response.data;
  },

  // Criar novo atendimento
  create: async (atendimentoData) => {
    const response = await api.post('/atendimentos', atendimentoData);
    return response.data;
  },

  // Atualizar atendimento
  update: async (id, updateData) => {
    const response = await api.put(`/atendimentos/${id}`, updateData);
    return response.data;
  }
};

export default atendimentoService;