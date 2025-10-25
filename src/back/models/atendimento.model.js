// back/models/atendimento.model.js

const { ObjectId } = require('mongodb');

function createAtendimentoModel(db) {
  const collection = db.collection('atendimentos');

  return {
    // Busca todos os atendimentos DE UM PACIENTE ESPECÍFICO
    async getAllByPacienteId(pacienteId) {
      return await collection.find({ pacienteId: new ObjectId(pacienteId) }).toArray();
    },

    // Busca um único atendimento pelo seu ID
    async getById(id) {
      return await collection.findOne({ _id: new ObjectId(id) });
    },

    // Cria um novo atendimento
    async create(atendimentoData) {
      // Garante que as strings de ID sejam convertidas para ObjectId
      const novoAtendimento = {
        ...atendimentoData,
        pacienteId: new ObjectId(atendimentoData.pacienteId),
        profissionalId: new ObjectId(atendimentoData.profissionalId),
        dataHoraAgendamento: new Date(),
      };
      return await collection.insertOne(novoAtendimento);
    },

    // Atualiza um atendimento (ex: adicionando a transcrição após ser realizado)
    async updateById(id, updateData) {
      return await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    },

    // Deleta um atendimento pelo ID
    async deleteById(id) {
      return await collection.deleteOne({ _id: new ObjectId(id) });
    },
  };
}

module.exports = createAtendimentoModel;