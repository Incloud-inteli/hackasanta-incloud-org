// back/models/user.model.js - VERSÃO PADRONIZADA COM DRIVER NATIVO

const { ObjectId } = require('mongodb');

function createUserModel(db) {
  const collection = db.collection('users'); // O nome da sua collection

  return {
    // Cria um novo usuário
    async create(userData) {
      return await collection.insertOne(userData);
    },

    // Busca um usuário pelo ID do Supabase
    async findBySupabaseId(supabaseUserId) {
      return await collection.findOne({ supabaseUserId: supabaseUserId });
    },

    // Busca um usuário pelo ID do MongoDB
    async getById(id) {
      return await collection.findOne({ _id: new ObjectId(id) });
    },
    
    // Busca todos os usuários
    async getAll() {
        return await collection.find({}).toArray();
    }
  };
}

module.exports = createUserModel;