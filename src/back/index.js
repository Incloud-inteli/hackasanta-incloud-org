// src/back/index.js - VERSÃO CORRIGIDA PARA SUPABASE

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js'); // Importa o cliente Supabase
const dotenv = require('dotenv');

dotenv.config();

// Importação das fábricas de rotas (continuam iguais)
const createPacienteRoutes = require('./routes/paciente.routes.js');
const createAtendimentoRoutes = require('./routes/atendimento.routes.js');
// const createProfissionalRoutes = require('./routes/profissional.routes.js'); // Removido se não for usar
const createResponsavelRoutes = require('./routes/responsavel.routes.js');
const createAlertaRoutes = require('./routes/alerta.routes.js');
const createProntuarioRoutes = require('./routes/prontuario.routes.js');
const createTranscritorRoutes = require('./routes/transcritor.routes.js');
const createAuthRoutes = require('./routes/auth.routes.js');
const createUserRoutes = require('./routes/user.routes.js');

const app = express();
const PORT = process.env.PORT || 3001;

// --- INICIALIZAÇÃO DO CLIENTE SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usa a chave de serviço no backend

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Cliente Supabase inicializado.');

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Rotas da Aplicação ---
app.get('/', (req, res) => {
  res.json({ message: '🚀 API Previvai está no ar! (Backend com Supabase)' });
});

// --- REGISTRO DAS ROTAS ---
// Passamos a instância do cliente 'supabase' para as rotas que precisam interagir com o banco
app.use('/api/pacientes', createPacienteRoutes(supabase));
app.use('/api/atendimentos', createAtendimentoRoutes(supabase));
// app.use('/api/profissionais', createProfissionalRoutes(supabase)); // Removido se não for usar
app.use('/api/responsaveis', createResponsavelRoutes(supabase));
app.use('/api/alertas', createAlertaRoutes(supabase));
app.use('/api/prontuarios', createProntuarioRoutes(supabase));
app.use('/api/transcritores', createTranscritorRoutes(supabase));
app.use('/api/auth', createAuthRoutes(supabase)); // Passa o cliente Supabase para Auth também
app.use('/api/users', createUserRoutes(supabase));

// Adiciona a rota de teste
const testRoutes = require('./routes/test.js');
app.use('/api/test', testRoutes);
console.log("👍 Todas as rotas foram registradas.");

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
});

// Tratamento de erros não capturados (opcional mas bom ter)
process.on('uncaughtException', (error) => {
  console.error('💥 Erro não capturado:', error);
  // process.exit(1); // Descomente se quiser derrubar o servidor em caso de erro grave
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Rejeição não tratada:', reason);
});