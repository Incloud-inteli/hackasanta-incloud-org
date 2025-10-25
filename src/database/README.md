# Database

Esta pasta contém os scripts e configurações do banco de dados.

## Estrutura

- `config.js` - Configurações de conexão com o banco de dados
- `migrations/` - Scripts de migração do banco de dados
- `seeds/` - Scripts de seed para popular o banco de dados com dados iniciais

## Configuração

Configure as variáveis de ambiente no arquivo `.env` na raiz do projeto backend:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=code4cancer_dev
DB_USER=postgres
DB_PASSWORD=your_password
```
