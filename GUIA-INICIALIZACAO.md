# 🚀 Guia de Inicialização - Quick Finance

## 📋 Pré-requisitos

Antes de iniciar o projeto, certifique-se de ter instalado:

### 1. Java Development Kit (JDK) 17+
- **Download**: https://adoptium.net/
- **Verificar instalação**:
  ```bash
  java -version
  ```
  Deve mostrar versão 17 ou superior

### 2. Node.js 18+ e npm
- **Download**: https://nodejs.org/
- **Verificar instalação**:
  ```bash
  node --version
  npm --version
  ```

### 3. PostgreSQL (Opcional - pode usar H2 em memória)
- **Download**: https://www.postgresql.org/download/
- **Porta padrão**: 5432
- **Senha sugerida**: postgres123

---

## 🗄️ Configuração do Banco de Dados

### Opção A: PostgreSQL (Produção)

#### Passo 1: Instalar PostgreSQL
Siga as instruções de instalação para seu sistema operacional.

#### Passo 2: Configurar o Banco
Execute o script automatizado:
```bash
configurar-postgresql.bat
```

Ou configure manualmente:
```sql
-- Conectar como postgres
psql -U postgres

-- Criar usuário e banco
CREATE USER qfinuser WITH PASSWORD 'qfinpass123';
CREATE DATABASE qfindb OWNER qfinuser;
GRANT ALL PRIVILEGES ON DATABASE qfindb TO qfinuser;
\q
```

#### Passo 3: Verificar Configuração
O arquivo `application.properties` já está configurado para PostgreSQL:
- **URL**: jdbc:postgresql://localhost:5432/qfindb
- **Usuário**: qfinuser
- **Senha**: qfinpass123

### Opção B: H2 Database (Desenvolvimento)

Para usar H2 (banco em memória), edite `qfin-backend/qfin-backend/src/main/resources/application.properties`:

1. **Comente** as linhas do PostgreSQL
2. **Descomente** as linhas do H2:
```properties
spring.datasource.url=jdbc:h2:mem:qfindb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

---

## 🔧 Inicialização do Projeto

### Método 1: Scripts Automatizados (Recomendado)

#### 1. Iniciar Backend
```bash
iniciar-backend.bat
```

O script irá:
- ✅ Verificar instalação do Java
- ✅ Limpar e compilar o projeto Maven
- ✅ Iniciar o servidor Spring Boot na porta 8080

**Backend estará disponível em**: http://localhost:8080

#### 2. Iniciar Frontend (em outro terminal)
```bash
iniciar-frontend.bat
```

O script irá:
- ✅ Verificar instalação do Node.js
- ✅ Instalar dependências npm
- ✅ Iniciar o servidor Vite de desenvolvimento

**Frontend estará disponível em**: http://localhost:5173

### Método 2: Comandos Manuais

#### Backend
```bash
cd qfin-backend/qfin-backend
mvnw clean install -DskipTests
mvnw spring-boot:run
```

#### Frontend
```bash
cd qfin-frontend
npm install
npm run dev
```

---

## 🧪 Verificação da Instalação

### 1. Verificar Backend
Abra o navegador em: http://localhost:8080

Endpoints disponíveis:
- **API Base**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/actuator/health (se configurado)
- **H2 Console** (se usando H2): http://localhost:8080/h2-console

### 2. Verificar Frontend
Abra o navegador em: http://localhost:5173

Você deve ver a página de login do Quick Finance.

### 3. Testar API
Execute o script de teste:
```bash
test-api.ps1
```

Ou teste manualmente com curl:
```bash
# Registrar usuário
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123!\"}"

# Login
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"Test123!\"}"
```

---

## 📁 Estrutura do Projeto

```
Projeto Quick Finance/
├── qfin-backend/              # Backend Spring Boot
│   └── qfin-backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/qfin/qfinbackend/
│       │   │   │   ├── config/          # Configurações (Security, CORS, JWT)
│       │   │   │   ├── controller/      # REST Controllers
│       │   │   │   ├── model/           # Entidades JPA
│       │   │   │   ├── repository/      # Repositórios JPA
│       │   │   │   └── service/         # Lógica de negócio
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/
│       ├── pom.xml                      # Dependências Maven
│       └── mvnw / mvnw.cmd             # Maven Wrapper
│
├── qfin-frontend/             # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── contexts/          # Context API (Auth)
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── services/          # Serviços API
│   │   ├── types/             # TypeScript types
│   │   └── config/            # Configurações
│   ├── package.json           # Dependências npm
│   └── vite.config.ts         # Configuração Vite
│
├── configurar-postgresql.bat  # Script de configuração DB
├── iniciar-backend.bat        # Script para iniciar backend
├── iniciar-frontend.bat       # Script para iniciar frontend
├── database-setup.sql         # Script SQL de setup
└── README-POSTGRESQL.md       # Documentação PostgreSQL
```

---

## 🔑 Funcionalidades Principais

### Backend (Spring Boot)
- ✅ Autenticação JWT
- ✅ CRUD de Transações
- ✅ CRUD de Financiamentos
- ✅ CRUD de Metas Financeiras
- ✅ Gerenciamento de Usuários
- ✅ CORS configurado
- ✅ Spring Security

### Frontend (React + TypeScript)
- ✅ Dashboard financeiro
- ✅ Gestão de transações
- ✅ Gestão de financiamentos
- ✅ Gestão de metas
- ✅ Perfil de usuário
- ✅ Gráficos e visualizações
- ✅ UI moderna com Tailwind CSS e shadcn/ui

---

## 🐛 Solução de Problemas

### Backend não inicia

**Problema**: Erro de porta já em uso
```
Port 8080 is already in use
```
**Solução**: 
- Pare outros serviços na porta 8080
- Ou altere a porta em `application.properties`:
  ```properties
  server.port=8081
  ```

**Problema**: Erro de conexão com PostgreSQL
```
Connection refused: localhost:5432
```
**Solução**:
- Verifique se PostgreSQL está rodando:
  ```bash
  # Windows
  net start postgresql-x64-15
  ```
- Ou use H2 (veja Opção B acima)

**Problema**: Java não encontrado
```
'java' is not recognized
```
**Solução**:
- Instale JDK 17+
- Configure JAVA_HOME nas variáveis de ambiente

### Frontend não inicia

**Problema**: Dependências não instaladas
```
Cannot find module
```
**Solução**:
```bash
cd qfin-frontend
rm -rf node_modules package-lock.json
npm install
```

**Problema**: Porta 5173 em uso
**Solução**: O Vite automaticamente usará outra porta (5174, 5175, etc.)

### Erro 403 na API

**Problema**: Requisições retornam 403 Forbidden
**Solução**: Consulte `SOLUCAO-COMPLETA-ERRO-403.md` para detalhes sobre configuração de CORS e autenticação.

---

## 📚 Documentação Adicional

- **README-POSTGRESQL.md**: Guia detalhado de configuração PostgreSQL
- **GUIA-DE-TESTES.md**: Guia de testes da aplicação
- **SOLUCAO-COMPLETA-ERRO-403.md**: Solução para erros de autenticação
- **RESUMO-SOLUCAO.md**: Resumo das soluções implementadas

---

## 🎯 Próximos Passos

Após inicializar o projeto:

1. **Criar conta**: Acesse http://localhost:5173 e registre-se
2. **Fazer login**: Use suas credenciais para acessar o sistema
3. **Explorar funcionalidades**:
   - Dashboard com visão geral financeira
   - Adicionar transações (receitas/despesas)
   - Criar metas financeiras
   - Gerenciar financiamentos
   - Atualizar perfil

---

## 🤝 Suporte

Se encontrar problemas:
1. Verifique os logs do backend no terminal
2. Verifique o console do navegador (F12) para erros do frontend
3. Consulte a documentação adicional listada acima
4. Verifique se todas as dependências estão instaladas corretamente

---

## ✅ Checklist de Inicialização

- [ ] Java 17+ instalado e configurado
- [ ] Node.js 18+ e npm instalados
- [ ] PostgreSQL instalado e configurado (ou usando H2)
- [ ] Banco de dados criado (qfindb)
- [ ] Backend compilado e rodando na porta 8080
- [ ] Frontend com dependências instaladas
- [ ] Frontend rodando na porta 5173
- [ ] Consegue acessar a página de login
- [ ] Consegue registrar e fazer login

**Projeto inicializado com sucesso! 🎉**
