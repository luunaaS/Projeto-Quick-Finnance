# 💰 Quick Finance

Sistema completo de gestão financeira pessoal desenvolvido com Spring Boot e React.

![Java](https://img.shields.io/badge/Java-17+-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)

## 📋 Sobre o Projeto

Quick Finance é uma aplicação web completa para gerenciamento financeiro pessoal que permite:

- 💳 **Gestão de Transações**: Controle completo de receitas e despesas
- 🎯 **Metas Financeiras**: Defina e acompanhe suas metas de economia
- 🏦 **Financiamentos**: Gerencie empréstimos e financiamentos
- 📊 **Dashboard Interativo**: Visualize suas finanças com gráficos e relatórios
- 👤 **Perfil de Usuário**: Gerencie suas informações pessoais
- 🔐 **Autenticação Segura**: Sistema de login com JWT

## 🚀 Início Rápido

### Pré-requisitos

- ☕ **Java 17+** - [Download](https://adoptium.net/)
- 📦 **Node.js 18+** - [Download](https://nodejs.org/)
- 🗄️ **PostgreSQL 15+** (opcional) - [Download](https://www.postgresql.org/download/)

### Instalação Automática

Execute o script de inicialização completa:

```bash
inicializar-projeto.bat
```

Este script irá:
1. ✅ Verificar todos os pré-requisitos
2. ✅ Configurar o banco de dados (PostgreSQL ou H2)
3. ✅ Instalar todas as dependências
4. ✅ Compilar o projeto
5. ✅ Iniciar os servidores (opcional)

### Instalação Manual

#### 1. Configurar Banco de Dados

**Opção A: PostgreSQL**
```bash
configurar-postgresql.bat
```

**Opção B: H2 (desenvolvimento)**
- O H2 já está configurado como alternativa
- Nenhuma configuração adicional necessária

#### 2. Iniciar Backend

```bash
iniciar-backend.bat
```

Ou manualmente:
```bash
cd qfin-backend/qfin-backend
mvnw clean install
mvnw spring-boot:run
```

**Backend disponível em**: http://localhost:8080

#### 3. Iniciar Frontend

```bash
iniciar-frontend.bat
```

Ou manualmente:
```bash
cd qfin-frontend
npm install
npm run dev
```

**Frontend disponível em**: http://localhost:5173

## 🏗️ Arquitetura

### Backend (Spring Boot)

```
qfin-backend/
├── config/          # Configurações (Security, CORS, JWT)
├── controller/      # REST Controllers
├── model/           # Entidades JPA
├── repository/      # Repositórios JPA
└── service/         # Lógica de negócio
```

**Tecnologias:**
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL / H2
- Maven

### Frontend (React + TypeScript)

```
qfin-frontend/
├── components/      # Componentes reutilizáveis
├── pages/           # Páginas da aplicação
├── services/        # Serviços de API
├── contexts/        # Context API (Auth)
└── types/           # TypeScript types
```

**Tecnologias:**
- React 18.3
- TypeScript 5.3
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- React Router

## 📚 Documentação

- 📖 **[GUIA-INICIALIZACAO.md](GUIA-INICIALIZACAO.md)** - Guia completo de inicialização
- 🗄️ **[README-POSTGRESQL.md](README-POSTGRESQL.md)** - Configuração PostgreSQL
- 🧪 **[GUIA-DE-TESTES.md](GUIA-DE-TESTES.md)** - Como testar a aplicação
- 🔧 **[SOLUCAO-COMPLETA-ERRO-403.md](SOLUCAO-COMPLETA-ERRO-403.md)** - Solução de problemas de autenticação

## 🎯 Funcionalidades

### Dashboard
- Visão geral das finanças
- Gráficos de receitas vs despesas
- Resumo de transações recentes
- Indicadores de metas

### Transações
- Adicionar receitas e despesas
- Categorização de transações
- Filtros e busca
- Histórico completo

### Financiamentos
- Cadastro de empréstimos
- Cálculo de parcelas
- Acompanhamento de pagamentos
- Simulações

### Metas Financeiras
- Definir objetivos de economia
- Acompanhar progresso
- Visualização de conquistas
- Alertas de metas

### Perfil
- Atualizar informações pessoais
- Alterar senha
- Configurações de conta

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

1. **Registro**: Crie uma conta com email e senha
2. **Login**: Receba um token JWT
3. **Acesso**: Use o token para acessar endpoints protegidos

**Endpoints públicos:**
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

**Endpoints protegidos:**
- `/api/transactions/**` - Transações
- `/api/financings/**` - Financiamentos
- `/api/goals/**` - Metas
- `/api/users/**` - Usuários

## 🧪 Testes

### Testar API com PowerShell

```powershell
.\test-api.ps1
```

### Testar manualmente

```bash
# Registrar usuário
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!"}'
```

## 🛠️ Desenvolvimento

### Backend

```bash
cd qfin-backend/qfin-backend

# Compilar
mvnw clean install

# Executar testes
mvnw test

# Executar aplicação
mvnw spring-boot:run
```

### Frontend

```bash
cd qfin-frontend

# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🐛 Solução de Problemas

### Porta já em uso

**Backend (8080):**
```properties
# application.properties
server.port=8081
```

**Frontend (5173):**
- Vite automaticamente usa outra porta disponível

### Erro de conexão com banco

1. Verifique se PostgreSQL está rodando
2. Confirme credenciais em `application.properties`
3. Ou use H2 como alternativa

### Erro 403 Forbidden

Consulte [SOLUCAO-COMPLETA-ERRO-403.md](SOLUCAO-COMPLETA-ERRO-403.md)

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **transactions** - Transações financeiras
- **financings** - Financiamentos e empréstimos
- **goals** - Metas financeiras

### Relacionamentos

```
users (1) ─── (N) transactions
users (1) ─── (N) financings
users (1) ─── (N) goals
```

## 🔒 Segurança

- ✅ Senhas criptografadas com BCrypt
- ✅ Autenticação JWT
- ✅ CORS configurado
- ✅ Proteção CSRF
- ✅ Validação de entrada
- ✅ SQL Injection prevention (JPA)

## 📝 Variáveis de Ambiente

### Backend (application.properties)

```properties
# Banco de Dados
spring.datasource.url=jdbc:postgresql://localhost:5432/qfindb
spring.datasource.username=qfinuser
spring.datasource.password=qfinpass123

# JWT
jwt.secret=mySecretKeyForJWTTokenGenerationAndValidation123456789
jwt.expiration=86400000
```

### Frontend (api.ts)

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto e está disponível para uso educacional.

## 👥 Autores

Desenvolvido como projeto de gestão financeira pessoal.

## 🙏 Agradecimentos

- Spring Boot Team
- React Team
- shadcn/ui
- Todos os contribuidores de bibliotecas open source utilizadas

## 📞 Suporte

Para problemas ou dúvidas:
1. Consulte a documentação em `/docs`
2. Verifique os logs do backend e frontend
3. Revise os guias de solução de problemas

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**

**🚀 Bom desenvolvimento!**
