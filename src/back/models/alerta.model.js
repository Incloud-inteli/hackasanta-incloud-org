// back/models/alerta.model.js

const { ObjectId } = require('mongodb');

function createAlertaModel(db) {
  const collection = db.collection('alertas');

  return {
    // Busca todos os alertas de um paciente específico
    async getAllByPacienteId(pacienteId) {
      return await collection.find({ pacienteId: new ObjectId(pacienteId) }).sort({ dataHoraGeracao: -1 }).toArray();
    },

    // Busca todos os alertas (geral, pode ser útil para um dashboard administrativo)
    async getAll() {
        // .sort({ dataHoraGeracao: -1 }) ordena do mais novo para o mais antigo
        return await collection.find({}).sort({ dataHoraGeracao: -1 }).toArray();
    },

    // Busca um único alerta pelo seu ID
    async getById(id) {
      return await collection.findOne({ _id: new ObjectId(id) });
    },

    // Cria um novo alerta
    async create(alertaData) {
      const novoAlerta = {
        ...alertaData,
        pacienteId: new ObjectId(alertaData.pacienteId),
        atendimentoId: new ObjectId(alertaData.atendimentoId),
        dataHoraGeracao: new Date(), // Pega a data e hora do momento da criação
      };
      return await collection.insertOne(novoAlerta);
    },

    // Atualiza um alerta (ex: para mudar o status de 'Pendente' para 'Resolvido')
    async updateById(id, updateData) {
      return await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    },
  };
}

module.exports = createAlertaModel;