# Documentação da API - Quick Finnance

## 1. Introdução

Esta documentação descreve os endpoints da API REST do sistema Quick Finnance. A API permite que aplicações cliente gerenciem finanças pessoais através de operações de criação, leitura, atualização e exclusão de dados.

## 2. Autenticação

A API utiliza autenticação baseada em **JSON Web Tokens (JWT)**. Para acessar os endpoints protegidos, é necessário incluir o token JWT no cabeçalho da requisição:

```
Authorization: Bearer {token}
```

## 3. Endpoints

### 3.1. Autenticação

#### 3.1.1. Registrar Novo Usuário

**Endpoint**: `POST /api/auth/register`

**Descrição**: Registra um novo usuário no sistema.

**Corpo da Requisição**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta de Sucesso** (201 Created):
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com"
}
```

#### 3.1.2. Login

**Endpoint**: `POST /api/auth/login`

**Descrição**: Autentica um usuário e retorna um token JWT.

**Corpo da Requisição**:
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta de Sucesso** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 86400000
}
```

### 3.2. Transações

#### 3.2.1. Listar Todas as Transações

**Endpoint**: `GET /api/transactions`

**Descrição**: Retorna todas as transações do usuário autenticado.

**Cabeçalhos**: `Authorization: Bearer {token}`

**Resposta de Sucesso** (200 OK):
```json
[
  {
    "id": 1,
    "type": "EXPENSE",
    "amount": 150.00,
    "category": "Alimentação",
    "description": "Almoço no restaurante",
    "date": "2025-11-01"
  },
  {
    "id": 2,
    "type": "INCOME",
    "amount": 3000.00,
    "category": "Salário",
    "description": "Salário mensal",
    "date": "2025-11-05"
  }
]
```

#### 3.2.2. Obter Transação por ID

**Endpoint**: `GET /api/transactions/{id}`

**Descrição**: Retorna uma transação específica do usuário autenticado.

**Cabeçalhos**: `Authorization: Bearer {token}`

**Parâmetros de URL**:
- `id` (Long): ID da transação

**Resposta de Sucesso** (200 OK):
```json
{
  "id": 1,
  "type": "EXPENSE",
  "amount": 150.00,
  "category": "Alimentação",
  "description": "Almoço no restaurante",
  "date": "2025-11-01"
}
```

**Resposta de Erro** (404 Not Found): Transação não encontrada.

#### 3.2.3. Criar Nova Transação

**Endpoint**: `POST /api/transactions`

**Descrição**: Cria uma nova transação para o usuário autenticado.

**Cabeçalhos**: `Authorization: Bearer {token}`

**Corpo da Requisição**:
```json
{
  "type": "EXPENSE",
  "amount": 150.00,
  "category": "Alimentação",
  "description": "Almoço no restaurante",
  "date": "2025-11-01"
}
```

**Validações**:
- `type`: Obrigatório (INCOME ou EXPENSE)
- `amount`: Obrigatório, deve ser maior que 0
- `category`: Obrigatório, não pode estar vazio
- `description`: Obrigatório, não pode estar vazio
- `date`: Obrigatório

**Resposta de Sucesso** (201 Created):
```json
{
  "id": 3,
  "type": "EXPENSE",
  "amount": 150.00,
  "category": "Alimentação",
  "description": "Almoço no restaurante",
  "date": "2025-11-01"
}
```

#### 3.2.4. Atualizar Transação

**Endpoint**: `PUT /api/transactions/{id}`

**Descrição**: Atualiza uma transação existente do usuário autenticado.

**Cabeçalhos**: `Authorization: Bearer {token}`

**Parâmetros de URL**:
- `id` (Long): ID da transação

**Corpo da Requisição**:
```json
{
  "type": "EXPENSE",
  "amount": 200.00,
  "category": "Alimentação",
  "description": "Jantar no restaurante",
  "date": "2025-11-01"
}
```

**Resposta de Sucesso** (200 OK):
```json
{
  "id": 1,
  "type": "EXPENSE",
  "amount": 200.00,
  "category": "Alimentação",
  "description": "Jantar no restaurante",
  "date": "2025-11-01"
}
```

**Resposta de Erro** (404 Not Found): Transação não encontrada.

#### 3.2.5. Excluir Transação

**Endpoint**: `DELETE /api/transactions/{id}`

**Descrição**: Exclui uma transação do usuário autenticado.

**Cabeçalhos**: `Authorization: Bearer {token}`

**Parâmetros de URL**:
- `id` (Long): ID da transação

**Resposta de Sucesso** (204 No Content): Transação excluída com sucesso.

### 3.3. Categorias

#### 3.3.1. Listar Todas as Categorias

**Endpoint**: `GET /api/categories`

**Descrição**: Retorna todas as categorias disponíveis para o usuário.

**Cabeçalhos**: `Authorization: Bearer {token}`

**Resposta de Sucesso** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Alimentação"
  },
  {
    "id": 2,
    "name": "Transporte"
  }
]
```

#### 3.3.2. Criar Nova Categoria

**Endpoint**: `POST /api/categories`

**Descrição**: Cria uma nova categoria personalizada.

**Cabeçalhos**: `Authorization: Bearer {token}`

**Corpo da Requisição**:
```json
{
  "name": "Educação"
}
```

**Resposta de Sucesso** (201 Created):
```json
{
  "id": 3,
  "name": "Educação"
}
```

### 3.4. Financiamentos

#### 3.4.1. Listar Todos os Financiamentos

**Endpoint**: `GET /api/financings`

**Descrição**: Retorna todos os financiamentos do usuário autenticado.

**Cabeçalhos**: `Authorization: Bearer {token}`

#### 3.4.2. Criar Novo Financiamento

**Endpoint**: `POST /api/financings`

**Descrição**: Cria um novo financiamento.

**Cabeçalhos**: `Authorization: Bearer {token}`

### 3.5. Metas Financeiras

#### 3.5.1. Listar Todas as Metas

**Endpoint**: `GET /api/goals`

**Descrição**: Retorna todas as metas financeiras do usuário autenticado.

**Cabeçalhos**: `Authorization: Bearer {token}`

#### 3.5.2. Criar Nova Meta

**Endpoint**: `POST /api/goals`

**Descrição**: Cria uma nova meta financeira.

**Cabeçalhos**: `Authorization: Bearer {token}`

### 3.6. Relatórios

#### 3.6.1. Gerar Relatório

**Endpoint**: `POST /api/reports`

**Descrição**: Gera um relatório financeiro com base nos filtros fornecidos.

**Cabeçalhos**: `Authorization: Bearer {token}`

**Corpo da Requisição**:
```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "type": "EXPENSE",
  "category": "Alimentação"
}
```

**Resposta de Sucesso** (200 OK):
```json
{
  "totalIncome": 3000.00,
  "totalExpense": 1500.00,
  "balance": 1500.00,
  "categories": [
    {
      "name": "Alimentação",
      "total": 800.00,
      "percentage": 53.33
    }
  ]
}
```

## 4. Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 OK | Requisição bem-sucedida |
| 201 Created | Recurso criado com sucesso |
| 204 No Content | Recurso excluído com sucesso |
| 400 Bad Request | Dados de entrada inválidos |
| 401 Unauthorized | Token de autenticação ausente ou inválido |
| 403 Forbidden | Acesso negado ao recurso |
| 404 Not Found | Recurso não encontrado |
| 500 Internal Server Error | Erro interno do servidor |

## 5. Exemplos de Uso

### 5.1. Exemplo com cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}'

# Criar transação
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"type":"EXPENSE","amount":150.00,"category":"Alimentação","description":"Almoço","date":"2025-11-01"}'
```

### 5.2. Exemplo com JavaScript (Axios)

```javascript
// Login
const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
  email: 'joao@example.com',
  password: 'senha123'
});

const token = loginResponse.data.token;

// Criar transação
const transaction = await axios.post('http://localhost:8080/api/transactions', {
  type: 'EXPENSE',
  amount: 150.00,
  category: 'Alimentação',
  description: 'Almoço',
  date: '2025-11-01'
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```
