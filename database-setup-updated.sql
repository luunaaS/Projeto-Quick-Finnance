-- ===================================================
-- Quick Finnance - Database Setup (PostgreSQL)
-- Atualizado com novas funcionalidades
-- ===================================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Financiamentos
CREATE TABLE IF NOT EXISTS financings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    monthly_payment DECIMAL(15,2) NOT NULL,
    type VARCHAR(100) NOT NULL,
    end_date DATE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Metas
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    deadline DATE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    category VARCHAR(255),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- ===================================================
-- NOVAS TABELAS - Funcionalidades Adicionais
-- ===================================================

-- Tabela de Investimentos
CREATE TABLE IF NOT EXISTS investments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- STOCKS, FUNDS, FIXED_INCOME, CRYPTO
    amount DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    quantity DECIMAL(15,6),
    average_price DECIMAL(15,2),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- BILL, BUDGET, GOAL, SUSPICIOUS
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) NOT NULL, -- HIGH, MEDIUM, LOW
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Configurações de Notificações
CREATE TABLE IF NOT EXISTS notification_settings (
    id BIGSERIAL PRIMARY KEY,
    bill_reminders BOOLEAN DEFAULT TRUE,
    budget_alerts BOOLEAN DEFAULT TRUE,
    goal_updates BOOLEAN DEFAULT TRUE,
    suspicious_activity BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    reminder_days INTEGER DEFAULT 3,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Transações Multi-Moeda
CREATE TABLE IF NOT EXISTS multi_currency_transactions (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    amount_in_base_currency DECIMAL(15,2),
    exchange_rate DECIMAL(15,6),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Taxas de Câmbio
CREATE TABLE IF NOT EXISTS exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    currency VARCHAR(10) NOT NULL UNIQUE,
    rate DECIMAL(15,6) NOT NULL,
    last_updated TIMESTAMP NOT NULL
);

-- Tabela de Transações Recorrentes
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    day_of_month INTEGER,
    day_of_week INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    auto_launch BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_processed DATE,
    next_processing DATE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- ===================================================
-- DADOS INICIAIS
-- ===================================================

-- Taxas de câmbio padrão (relativas ao BRL)
INSERT INTO exchange_rates (currency, rate, last_updated) VALUES
    ('USD', 0.20, NOW()),
    ('EUR', 0.18, NOW()),
    ('GBP', 0.16, NOW()),
    ('JPY', 28.50, NOW()),
    ('CAD', 0.27, NOW()),
    ('AUD', 0.31, NOW()),
    ('CHF', 0.18, NOW()),
    ('BRL', 1.00, NOW())
ON CONFLICT (currency) DO NOTHING;

-- ===================================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_financings_user_id ON financings(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_multi_currency_user_id ON multi_currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_processing ON recurring_transactions(next_processing);
