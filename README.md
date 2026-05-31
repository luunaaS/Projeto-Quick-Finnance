# Projeto Quick Finnance

## Descrição
O **Quick Finnance** é um sistema web completo e intuitivo para gerenciamento de finanças pessoais. Desenvolvido como uma aplicação full-stack, ele permite que usuários registrem receitas e despesas, visualizem relatórios de saldo, categorizem transações, gerenciem investimentos, controlem financiamentos e muito mais. Ideal para quem busca uma ferramenta robusta para controlar o orçamento com funcionalidades avançadas.

O projeto foi criado com foco em usabilidade, utilizando tecnologias web modernas para uma interface responsiva que funciona em desktops e dispositivos móveis. A arquitetura segue o padrão de aplicação de página única (SPA) com um backend robusto em Spring Boot.

## Estrutura do Projeto

```
Projeto-Quick-Finnance/
├── qfin-backend/              # Backend Spring Boot (Java 17)
│   └── qfin-backend/
│       ├── src/main/java/     # Código fonte Java
│       ├── src/main/resources/ # Configurações
│       ├── pom.xml            # Dependências Maven
│       └── mvnw               # Maven Wrapper
├── qfin-frontend/             # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── app/               # Componentes React
│   │   └── services/          # Serviço de API
│   ├── package.json
│   └── vite.config.ts
├── database-setup-updated.sql # Script SQL para PostgreSQL
└── README.md
```

## Funcionalidades

### Páginas Principais
- **Dashboard** - Visão geral das finanças com cards de resumo (receitas, despesas, saldo), gráficos financeiros e transações recentes
- **Transações** - CRUD completo de transações com sistema de filtros (busca, tipo, categoria) e cards de resumo consolidado
- **Financiamentos** - Gerenciamento de financiamentos com progresso visual, categorização por tipo (Imóvel, Veículo, etc.)
- **Relatórios** - Análise detalhada com gráficos, filtros por período (1m, 3m, 6m, 1y), exportação CSV/PDF

### Funcionalidades Avançadas
- **Notificações** - Sistema completo de notificações in-app com 4 tipos (contas a vencer, orçamentos, metas, transações suspeitas), configurações personalizadas e controle de prioridade
- **Multi-Moeda** - Suporte para 8 moedas (BRL, USD, EUR, GBP, JPY, CAD, AUD, CHF) com conversão automática para moeda base e taxas de câmbio atualizadas
- **Investimentos** - Gestão de portfólio com 4 tipos (Ações, Fundos, Renda Fixa, Criptomoedas), cálculo automático de rentabilidade e distribuição por tipo
- **Recorrência** - Transações recorrentes (diária, semanal, mensal, anual) com lançamento automático ou com confirmação

### Páginas Auxiliares
- **Ajuda/FAQ** - Manual completo do usuário com sistema de accordion e guia de funcionalidades

## Tecnologias Utilizadas

### Backend
- Java 17 com Spring Boot 3.2.5
- Spring Security + JWT (autenticação stateless)
- Spring Data JPA (persistência)
- H2 Database (desenvolvimento) / PostgreSQL (produção)
- Lombok (redução de boilerplate)
- Apache Commons CSV (exportação CSV)
- iText 7 (geração de PDF)
- Spring Scheduling (processamento automático de recorrências)

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- Radix UI (componentes acessíveis)
- Lucide Icons (ícones)

## Pré-requisitos
- Java JDK 17 instalado
- Maven para gerenciamento de dependências do backend (ou use o Maven Wrapper incluído)
- Node.js (versão 18 ou superior) para o frontend
- Git para clonar o repositório
- PostgreSQL (para produção) ou H2 (desenvolvimento - já incluído)

## Instalação e Execução

### 1. Clone o repositório
```bash
git clone https://github.com/luunaaS/Projeto-Quick-Finnance.git
cd Projeto-Quick-Finnance
```

### 2. Backend
```bash
cd qfin-backend/qfin-backend

# Desenvolvimento (H2 em arquivo local)
./mvnw spring-boot:run

# O servidor inicia em http://localhost:8080
```

Para usar PostgreSQL em produção, edite `src/main/resources/application.properties`:
```properties
# Comente as linhas do H2 e descomente:
spring.datasource.url=jdbc:postgresql://localhost:5432/qfindb
spring.datasource.username=qfinuser
spring.datasource.password=qfinpass123
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### 3. Frontend
```bash
cd qfin-frontend

# Instalar dependências
npm install

# Criar arquivo de ambiente (opcional)
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev

# O frontend inicia em http://localhost:5173
```

### Variáveis de Ambiente (Frontend)
```
VITE_API_URL=http://localhost:8080/api
```

## API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registro de novo usuário |
| POST | `/api/auth/login` | Login (retorna JWT + dados do usuário) |
| PUT | `/api/auth/profile` | Atualizar perfil |
| PUT | `/api/auth/change-password` | Alterar senha |

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard` | Resumo financeiro completo |

### Transações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/transactions` | Listar transações do usuário |
| POST | `/api/transactions` | Criar nova transação |
| PUT | `/api/transactions/{id}` | Atualizar transação |
| DELETE | `/api/transactions/{id}` | Excluir transação |

### Financiamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/financings` | Listar financiamentos |
| POST | `/api/financings` | Criar financiamento |
| PUT | `/api/financings/{id}` | Atualizar financiamento |
| DELETE | `/api/financings/{id}` | Excluir financiamento |

### Investimentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/investments` | Listar investimentos |
| GET | `/api/investments/type/{type}` | Filtrar por tipo (STOCKS, FUNDS, FIXED_INCOME, CRYPTO) |
| POST | `/api/investments` | Criar investimento |
| PUT | `/api/investments/{id}` | Atualizar investimento |
| DELETE | `/api/investments/{id}` | Excluir investimento |

### Notificações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/notifications` | Listar todas as notificações |
| GET | `/api/notifications/unread` | Listar não lidas |
| GET | `/api/notifications/unread/count` | Contar não lidas |
| POST | `/api/notifications` | Criar notificação |
| PATCH | `/api/notifications/{id}/read` | Marcar como lida |
| PATCH | `/api/notifications/read-all` | Marcar todas como lidas |
| DELETE | `/api/notifications/{id}` | Excluir notificação |
| GET | `/api/notifications/settings` | Obter configurações |
| PUT | `/api/notifications/settings` | Atualizar configurações |

### Multi-Moeda
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/multi-currency/transactions` | Listar transações multi-moeda |
| POST | `/api/multi-currency/transactions` | Criar transação multi-moeda |
| PUT | `/api/multi-currency/transactions/{id}` | Atualizar transação |
| DELETE | `/api/multi-currency/transactions/{id}` | Excluir transação |
| GET | `/api/multi-currency/exchange-rates` | Obter taxas de câmbio |
| POST | `/api/multi-currency/exchange-rates` | Atualizar taxa |
| GET | `/api/multi-currency/convert?from=USD&to=BRL&amount=100` | Converter moeda |

### Transações Recorrentes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/recurring-transactions` | Listar recorrências |
| POST | `/api/recurring-transactions` | Criar recorrência |
| PUT | `/api/recurring-transactions/{id}` | Atualizar recorrência |
| PATCH | `/api/recurring-transactions/{id}/toggle` | Ativar/Desativar |
| DELETE | `/api/recurring-transactions/{id}` | Excluir recorrência |

### Relatórios
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/reports/summary` | Resumo do período |
| POST | `/api/reports/transactions` | Transações filtradas |
| POST | `/api/reports/export/transactions/csv` | Exportar transações CSV |
| POST | `/api/reports/export/pdf` | Exportar relatório PDF |
| GET | `/api/reports/export/financings/csv` | Exportar financiamentos CSV |

## Banco de Dados

### Desenvolvimento (H2)
O projeto já vem configurado com H2 em modo arquivo. As tabelas são criadas automaticamente via JPA (`ddl-auto=update`).

### Produção (PostgreSQL)
1. Crie o banco de dados:
```sql
CREATE DATABASE qfindb;
CREATE USER qfinuser WITH PASSWORD 'qfinpass123';
GRANT ALL PRIVILEGES ON DATABASE qfindb TO qfinuser;
```

2. Execute o script `database-setup-updated.sql` para criar as tabelas e índices.

3. Atualize o `application.properties` para usar PostgreSQL.

## Segurança

- Autenticação via JWT (JSON Web Token) com expiração de 24h
- Senhas criptografadas com BCrypt
- Sessões stateless (sem cookies de sessão)
- CORS configurado para desenvolvimento
- Todas as rotas protegidas exceto `/api/auth/login` e `/api/auth/register`
- Dados isolados por usuário (multi-tenant)

## Processamento Automático

- **Transações Recorrentes**: Processadas automaticamente às 6h diariamente via `@Scheduled`. Se `autoLaunch` estiver ativo, cria transações reais automaticamente.
- **Taxas de Câmbio**: Inicializadas automaticamente na primeira execução com valores padrão.
- **Categorias**: Categorias padrão criadas automaticamente no registro de novo usuário.

## Licença

Projeto acadêmico - Quick Finnance
