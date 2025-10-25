const { ObjectId } = require('mongodb');

function createProntuarioModel(db) {
  const collection = db.collection('prontuarios');

  return {
    /**
     * Cria um novo documento de prontuário.
     */
    async create(prontuarioData) {
      return await collection.insertOne(prontuarioData);
    },

    /**
     * Busca um prontuário pelo ID do paciente associado.
     */
    async getByPacienteId(pacienteId) {
      return await collection.findOne({ pacienteId: new ObjectId(pacienteId) });
    },

    /**
     * Atualiza um prontuário pelo seu próprio _id.
     */
    async update(id, updateData) {
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return result.modifiedCount > 0;
    },
  };
}

module.exports = createProntuarioModel;