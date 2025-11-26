-- Script para adicionar a tabela de pagamentos ao banco de dados
-- Execute este script após configurar o banco de dados principal

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payment (
    id BIGSERIAL PRIMARY KEY,
    amount DECIMAL(19, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    description VARCHAR(255),
    financing_id BIGINT NOT NULL,
    CONSTRAINT fk_payment_financing FOREIGN KEY (financing_id) REFERENCES financing(id) ON DELETE CASCADE
);

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_payment_financing_id ON payment(financing_id);
CREATE INDEX IF NOT EXISTS idx_payment_date ON payment(payment_date);

-- Comentários para documentação
COMMENT ON TABLE payment IS 'Tabela para armazenar pagamentos de parcelas de financiamentos';
COMMENT ON COLUMN payment.id IS 'Identificador único do pagamento';
COMMENT ON COLUMN payment.amount IS 'Valor do pagamento realizado';
COMMENT ON COLUMN payment.payment_date IS 'Data em que o pagamento foi realizado';
COMMENT ON COLUMN payment.description IS 'Descrição opcional do pagamento';
COMMENT ON COLUMN payment.financing_id IS 'Referência ao financiamento relacionado';
