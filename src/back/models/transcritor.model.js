module.exports = (db) => {
  const collection = db.collection('transcritores');

  return {
    async getAll() {
      return await collection.find().toArray();
    },

    async getById(id) {
      const { ObjectId } = require('mongodb');
      return await collection.findOne({ _id: new ObjectId(id) });
    },

    async create(transcritor) {
      const result = await collection.insertOne(transcritor);
      return result.ops ? result.ops[0] : { _id: result.insertedId, ...transcritor };
    },

    async update(id, data) {
      const { ObjectId } = require('mongodb');
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      return result.modifiedCount > 0;
    },

    async delete(id) {
      const { ObjectId } = require('mongodb');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    }
  };
};