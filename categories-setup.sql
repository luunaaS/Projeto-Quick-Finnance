-- Script para criar tabela de categorias personalizadas
-- Execute este script após o database-setup.sql

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    parent_id BIGINT,
    is_default BOOLEAN DEFAULT FALSE,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE (user_id, name, type)
);

-- Criar índices para melhor performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_user_type ON categories(user_id, type);

-- Comentários nas colunas
COMMENT ON TABLE categories IS 'Tabela de categorias personalizadas de receitas e despesas';
COMMENT ON COLUMN categories.id IS 'ID único da categoria';
COMMENT ON COLUMN categories.name IS 'Nome da categoria';
COMMENT ON COLUMN categories.type IS 'Tipo da categoria: INCOME (receita) ou EXPENSE (despesa)';
COMMENT ON COLUMN categories.parent_id IS 'ID da categoria pai (NULL para categorias principais)';
COMMENT ON COLUMN categories.is_default IS 'Indica se é uma categoria padrão do sistema';
COMMENT ON COLUMN categories.user_id IS 'ID do usuário dono da categoria';

-- Exemplo de inserção de categorias padrão para um usuário (substitua 1 pelo ID do usuário)
-- Estas categorias serão criadas automaticamente pelo backend ao registrar um novo usuário

-- Categorias de RECEITA padrão:
-- INSERT INTO categories (name, type, parent_id, is_default, user_id) VALUES
-- ('Salário', 'INCOME', NULL, TRUE, 1),
-- ('Freelance', 'INCOME', NULL, TRUE, 1),
-- ('Investimentos', 'INCOME', NULL, TRUE, 1),
-- ('Aluguel', 'INCOME', NULL, TRUE, 1),
-- ('Outros', 'INCOME', NULL, TRUE, 1);

-- Categorias de DESPESA padrão:
-- INSERT INTO categories (name, type, parent_id, is_default, user_id) VALUES
-- ('Alimentação', 'EXPENSE', NULL, TRUE, 1),
-- ('Transporte', 'EXPENSE', NULL, TRUE, 1),
-- ('Moradia', 'EXPENSE', NULL, TRUE, 1),
-- ('Saúde', 'EXPENSE', NULL, TRUE, 1),
-- ('Educação', 'EXPENSE', NULL, TRUE, 1),
-- ('Lazer', 'EXPENSE', NULL, TRUE, 1),
-- ('Compras', 'EXPENSE', NULL, TRUE, 1),
-- ('Outros', 'EXPENSE', NULL, TRUE, 1);

-- Exemplo de subcategorias (descomente e ajuste os IDs conforme necessário):
-- INSERT INTO categories (name, type, parent_id, is_default, user_id) VALUES
-- ('Supermercado', 'EXPENSE', (SELECT id FROM categories WHERE name = 'Alimentação' AND user_id = 1), FALSE, 1),
-- ('Restaurantes', 'EXPENSE', (SELECT id FROM categories WHERE name = 'Alimentação' AND user_id = 1), FALSE, 1),
-- ('Gasolina', 'EXPENSE', (SELECT id FROM categories WHERE name = 'Transporte' AND user_id = 1), FALSE, 1),
-- ('Uber/Taxi', 'EXPENSE', (SELECT id FROM categories WHERE name = 'Transporte' AND user_id = 1), FALSE, 1);

COMMIT;
