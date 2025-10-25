// back/models/profissional.model.js

const { ObjectId } = require('mongodb');

function createProfissionalModel(db) {
  const collection = db.collection('profissionais');

  return {
    // Busca todos os profissionais
    async getAll() {
      return await collection.find({}).toArray();
    },

    // Busca um único profissional pelo seu ID
    async getById(id) {
      return await collection.findOne({ _id: new ObjectId(id) });
    },

    // Cria um novo profissional
    async create(profissionalData) {
      return await collection.insertOne(profissionalData);
    },

    // Atualiza um profissional pelo ID
    async updateById(id, updateData) {
      return await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    },

    // Deleta um profissional pelo ID
    async deleteById(id) {
      return await collection.deleteOne({ _id: new ObjectId(id) });
    },
  };
}

module.exports = createProfissionalModel;