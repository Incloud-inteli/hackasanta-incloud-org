// src/back/services/supabaseClient.js - CORRIGIDO

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config(); // Carrega as variáveis do arquivo .env

const supabaseUrl = process.env.SUPABASE_URL;
// CORREÇÃO: Usar a chave de serviço (secreta) no backend!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verifica se as variáveis foram carregadas corretamente
if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Erro Fatal: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas no arquivo .env");
    console.error("Verifique seu arquivo .env na pasta 'back'.");
    process.exit(1); // Encerra a aplicação se as chaves não estiverem configuradas
}

// Inicializa o cliente Supabase com a URL e a chave de serviço
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    // Opção importante para o backend: desativa a renovação automática de token
    // já que a chave de serviço não expira.
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
});

console.log("🔑 Cliente Supabase (backend) inicializado com Service Role Key.");

module.exports = { supabase };