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
    // Garante que os dados estejam aninhados corretamente
    const payload = {
      usuario_id: pacienteData.usuario_id,
      dadosPessoais: pacienteData.dadosPessoais || {},
      historicoMedico: pacienteData.historicoMedico || {},
      historicoFamiliar: pacienteData.historicoFamiliar || {},
      dadosContato: pacienteData.dadosContato || {},
      dadosEndereco: pacienteData.dadosEndereco || {},
      formType: pacienteData.formType,
      parentesco: pacienteData.parentesco,
      // Adicione outros campos aninhados conforme necessário
    };
    const response = await api.post('/pacientes', payload);
    return response.data;
  },

  // Atualizar paciente
  update: async (id, updateData) => {
    // Garante que os dados estejam aninhados corretamente
    const payload = {
      usuario_id: updateData.usuario_id,
      dadosPessoais: updateData.dadosPessoais || {},
      historicoMedico: updateData.historicoMedico || {},
      historicoFamiliar: updateData.historicoFamiliar || {},
      dadosContato: updateData.dadosContato || {},
      dadosEndereco: updateData.dadosEndereco || {},
      formType: updateData.formType,
      parentesco: updateData.parentesco,
      // Adicione outros campos aninhados conforme necessário
    };
    const response = await api.put(`/pacientes/${id}`, payload);
    return response.data;
  },

  // Deletar paciente
  delete: async (id) => {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  }
};

export default pacienteService;