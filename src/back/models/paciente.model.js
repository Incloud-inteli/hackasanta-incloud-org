const { ObjectId } = require('mongodb');

function createPacienteModel(db) {
  const collection = db.collection('pacientes');

  return {
    async create(pacienteData) {
      // O model é responsável por adicionar campos automáticos
      const novoPaciente = {
        ...pacienteData,
        dataCadastro: new Date(),
      };
      return await collection.insertOne(novoPaciente);
    },

    async getAll() {
      return await collection.find({}).toArray();
    },
    
    // Busca um único paciente pelo ID de autenticação do Supabase
    async findByAuthId(userId) {
      // Busca pelo paciente principal
      const pacienteDireto = await collection.findOne({ userId });
      // Busca pelos pacientes onde o usuário é um responsável
      const pacientesComoResponsavel = await collection.find({ 'responsaveis.userId': userId }).toArray();
      
      const pacientes = [];
      if (pacienteDireto) pacientes.push(pacienteDireto);
      pacientes.push(...pacientesComoResponsavel);

      // Remove duplicatas caso o usuário seja o paciente e também responsável de si mesmo
      const ids = new Set(pacientes.map(p => p._id.toString()));
      return Array.from(ids).map(id => pacientes.find(p => p._id.toString() === id));
    },

    async getById(id) {
      return await collection.findOne({ _id: new ObjectId(id) });
    },

    async updateById(id, updateData) {
      return await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updateData,
          $currentDate: { 'prontuario.dataUltimaAtualizacao': true }
        }
      );
    },

    async deleteById(id) {
      return await collection.deleteOne({ _id: new ObjectId(id) });
    },
  };
}

module.exports = createPacienteModel;