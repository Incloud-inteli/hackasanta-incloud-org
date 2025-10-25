// back/models/responsavel.model.js

const { ObjectId } = require('mongodb');

function createResponsavelModel(db) {
  const collection = db.collection('responsaveis');

  return {
    // Busca todos os responsáveis
    async getAll() {
      return await collection.find({}).toArray();
    },

    // Busca um único responsável pelo seu ID
    async getById(id) {
      return await collection.findOne({ _id: new ObjectId(id) });
    },

    // Cria um novo responsável
    async create(responsavelData) {
      return await collection.insertOne(responsavelData);
    },

    // Atualiza um responsável pelo ID
    async updateById(id, updateData) {
      return await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    },

    // Deleta um responsável pelo ID
    async deleteById(id) {
      return await collection.deleteOne({ _id: new ObjectId(id) });
    },
  };
}

module.exports = createResponsavelModel;