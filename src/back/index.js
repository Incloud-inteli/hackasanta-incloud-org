// src/back/index.js - VERSÃO DE DEBUG PARA ACHAR O ARQUIVO COM ERRO

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

console.log("🔎 Iniciando importações...");
const createPacienteRoutes = require('./routes/paciente.routes.js');
console.log("  - ✅ Carregou paciente.routes.js");
const createAtendimentoRoutes = require('./routes/atendimento.routes.js');
console.log("  - ✅ Carregou atendimento.routes.js");
const createProfissionalRoutes = require('./routes/profissional.routes.js');
console.log("  - ✅ Carregou profissional.routes.js");
const createResponsavelRoutes = require('./routes/responsavel.routes.js');
console.log("  - ✅ Carregou responsavel.routes.js");
const createAlertaRoutes = require('./routes/alerta.routes.js');
console.log("  - ✅ Carregou alerta.routes.js");
const createProntuarioRoutes = require('./routes/prontuario.routes.js');
console.log("  - ✅ Carregou prontuario.routes.js");
const createTranscritorRoutes = require('./routes/transcritor.routes.js');
console.log("  - ✅ Carregou transcritor.routes.js");
const createAuthRoutes = require('./routes/auth.routes.js');
console.log("  - ✅ Carregou auth.routes.js");
const createUserRoutes = require('./routes/user.routes.js');
console.log("  - ✅ Carregou user.routes.js");
console.log("👍 Todas as importações foram encontradas!");

const app = express();
const PORT = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
const dbName = 'previvai';

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado com sucesso ao banco de dados!');
    const db = client.db(dbName);

    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => {
      res.json({ message: '🚀 API Previvai está no ar!' });
    });

    console.log("⚙️  Registrando rotas...");
    app.use('/api/pacientes', createPacienteRoutes(db));
    app.use('/api/atendimento', createAtendimentoRoutes(db));
    app.use('/api/profissionais', createProfissionalRoutes(db));
    app.use('/api/responsaveis', createResponsavelRoutes(db));
    app.use('/api/alertas', createAlertaRoutes(db));
    app.use('/api/prontuarios', createProntuarioRoutes(db));
    app.use('/api/transcritores', createTranscritorRoutes(db));
    app.use('/api/auth', createAuthRoutes(db));
    app.use('/api/users', createUserRoutes(db));
    console.log("👍 Todas as rotas foram registradas com sucesso!");


    app.listen(PORT, () => {
      console.log(`🌐 Servidor rodando na porta ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Erro na inicialização:', err);
    process.exit(1);
  }
}

run();