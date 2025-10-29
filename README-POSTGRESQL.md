# Configuração PostgreSQL - Quick Finance

## 🚀 Instalação Rápida

### 1. Instalar PostgreSQL

**Windows:**
- Download: https://www.postgresql.org/download/windows/
- Instalar com senha: `postgres123`
- Porta padrão: `5432`

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
```

### 2. Criar Banco de Dados

**Opção A - Via pgAdmin (Windows):**
1. Abrir pgAdmin 4
2. Criar usuário: `qfinuser` / senha: `qfinpass123`
3. Criar banco: `qfindb` (owner: qfinuser)

**Opção B - Via Terminal:**
```bash
# Windows
cd "C:\Program Files\PostgreSQL\15\bin"
psql -U postgres

# Linux
sudo -u postgres psql

# Executar:
CREATE USER qfinuser WITH PASSWORD 'qfinpass123';
CREATE DATABASE qfindb OWNER qfinuser;
GRANT ALL PRIVILEGES ON DATABASE qfindb TO qfinuser;
\q
```

### 3. Configuração Já Aplicada

✅ `pom.xml` - Dependência PostgreSQL adicionada
✅ `application.properties` - Configurado para PostgreSQL
✅ `database-setup.sql` - Script SQL disponível

### 4. Iniciar Aplicação

```bash
# O Hibernate criará as tabelas automaticamente
iniciar-backend.bat
```

## 🔍 Verificar Conexão

```bash
psql -U qfinuser -d qfindb
\dt  # Listar tabelas
\q   # Sair
```

## ⚠️ Troubleshooting

**Erro de conexão:**
```bash
# Windows - Iniciar serviço
net start postgresql-x64-15
```

**Senha incorreta:**
```sql
psql -U postgres
ALTER USER qfinuser WITH PASSWORD 'qfinpass123';
```

## 🔄 Voltar para H2

Edite `application.properties`:
- Comente linhas PostgreSQL
- Descomente linhas H2
- Reinicie aplicação

## 📊 Credenciais

- **Banco:** qfindb
- **Usuário:** qfinuser
- **Senha:** qfinpass123
- **Porta:** 5432
- **Host:** localhost
