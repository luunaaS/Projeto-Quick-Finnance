# Quick Finance - Setup e Execução

## 🎯 O que foi implementado

### Backend (Spring Boot)
✅ Configuração completa do backend na porta 8080
✅ CORS configurado para aceitar requisições do frontend (porta 5173)
✅ Autenticação JWT implementada
✅ Relacionamento User ↔ Transactions
✅ Relacionamento User ↔ Financings
✅ Controllers com filtros por usuário autenticado
✅ Services atualizados com métodos específicos por usuário

### Frontend (React + TypeScript + Vite)
✅ Configuração da API para conectar com backend (porta 8080)
✅ AuthContext atualizado para usar backend real
✅ Serviços de Transactions e Financings conectados
✅ Componentes atualizados com tipos corretos (INCOME/EXPENSE)
✅ Página de Transactions criada

### Páginas Criadas
✅ Login
✅ Register  
✅ Dashboard
✅ Transactions (nova)
✅Financings (nova)
✅Profile (nova)

## 🚀 Como Executar

### 1. Backend (Spring Boot)

```bash
cd qfin-backend/qfin-backend

# Compilar o projeto
./mvnw clean install

# Executar o backend
./mvnw spring-boot:run
```

O backend estará rodando em: `http://localhost:8080`

### 2. Frontend (React + Vite)

```bash
cd qfin-frontend

# Instalar dependências (se necessário)
npm install

# Executar o frontend
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

## 📝 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login

### Transações
- `GET /api/transactions` - Listar transações do usuário
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/{id}` - Atualizar transação
- `DELETE /api/transactions/{id}` - Deletar transação

### Financiamentos
- `GET /api/financings` - Listar financiamentos do usuário
- `POST /api/financings` - Criar financiamento
- `PUT /api/financings/{id}` - Atualizar financiamento
- `DELETE /api/financings/{id}` - Deletar financiamento

## 🔐 Autenticação

O sistema usa JWT (JSON Web Token) para autenticação:
1. Faça login ou registre-se
2. O token é armazenado no localStorage
3. Todas as requisições incluem o token no header `Authorization: Bearer {token}`

## 📊 Banco de Dados

O projeto usa H2 Database (em memória) para desenvolvimento:
- Console H2: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:qfindb`
- Username: `sa`
- Password: (vazio)

## 🔄 Fluxo de Uso

1. **Registrar/Login**: Crie uma conta ou faça login
2. **Dashboard**: Visualize resumo financeiro
3. **Transações**: Adicione receitas e despesas
4. **Financiamentos**: Gerencie seus financiamentos

## ⚠️ Notas Importantes

- O backend deve estar rodando antes do frontend
- Os dados são perdidos ao reiniciar o backend (H2 em memória)
- Para produção, configure um banco de dados persistente
- Atualize a secret JWT em `application.properties` para produção

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se o backend está rodando na porta 8080
- Verifique se o frontend está rodando na porta 5173

### Erro de Autenticação
- Limpe o localStorage do navegador
- Faça login novamente

### Erro de Compilação (Backend)
- Execute: `./mvnw clean install -U`
- Verifique se o Java 17+ está instalado

### Erro de Dependências (Frontend)
- Delete `node_modules` e `package-lock.json`
- Execute: `npm install`