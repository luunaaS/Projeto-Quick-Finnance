-- ============================================
-- Script de Configuração do Banco de Dados
-- Quick Finance - PostgreSQL
-- ============================================

-- Criar banco de dados
CREATE DATABASE qfindb
    WITH 
    OWNER = qfinuser
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar ao banco de dados
\c qfindb

-- Criar usuário (se não existir)
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'qfinuser') THEN
      CREATE USER qfinuser WITH PASSWORD 'qfinpass123';
   END IF;
END
$$;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE qfindb TO qfinuser;
GRANT ALL ON SCHEMA public TO qfinuser;

-- ============================================
-- Tabelas serão criadas automaticamente pelo Hibernate
-- com spring.jpa.hibernate.ddl-auto=update
-- ============================================

-- Verificar tabelas criadas
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- ============================================
-- Queries úteis para administração
-- ============================================

-- Ver todos os usuários
-- SELECT * FROM users;

-- Ver todas as transações
-- SELECT * FROM transactions;

-- Ver todos os financiamentos
-- SELECT * FROM financings;

-- Ver todas as metas
-- SELECT * FROM goals;

-- Limpar todas as tabelas (CUIDADO!)
-- TRUNCATE TABLE goals, financings, transactions, users CASCADE;

-- Deletar banco de dados (CUIDADO!)
-- DROP DATABASE IF EXISTS qfindb;
