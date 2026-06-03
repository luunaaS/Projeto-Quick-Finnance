-- Migration v2: RBAC, Audit Log, Password Reset, CPF
-- Executar após o database-setup-updated.sql

-- 1. Adicionar campos CPF e role na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';

-- Preencher role para usuários já existentes (criados antes desta migração)
UPDATE users SET role = 'USER' WHERE role IS NULL;

-- 2. Tabela de log de ações (Histórico)
CREATE TABLE IF NOT EXISTS action_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    details VARCHAR(500),
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_action_logs_user_id ON action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_timestamp ON action_logs(timestamp DESC);

-- 3. Tabela de tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- 4. Criar usuário administrador padrão (senha: Admin@123 - trocar após primeiro acesso)
-- Hash BCrypt de 'Admin@123'
INSERT INTO users (name, email, password, role)
VALUES ('Administrador', 'admin@qfin.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RohmK84fqT4/2cFAu', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
