# Guia de Implementação - Categorias Personalizadas

## Visão Geral

Este guia documenta a implementação da funcionalidade de categorias e subcategorias personalizadas para receitas e despesas no sistema Quick Finance.

## Funcionalidades Implementadas

### Backend (Java/Spring Boot)

#### 1. Modelo de Dados
- **Arquivo**: `qfin-backend/qfin-backend/src/main/java/com/qfin/qfinbackend/model/Category.java`
- **Campos**:
  - `id`: ID único da categoria
  - `name`: Nome da categoria
  - `type`: Tipo (INCOME ou EXPENSE)
  - `parentId`: ID da categoria pai (null para categorias principais)
  - `isDefault`: Indica se é uma categoria padrão do sistema
  - `userId`: ID do usuário dono da categoria

#### 2. Repository
- **Arquivo**: `qfin-backend/qfin-backend/src/main/java/com/qfin/qfinbackend/repository/CategoryRepository.java`
- **Métodos principais**:
  - `findByUserId`: Buscar todas as categorias de um usuário
  - `findByUserIdAndType`: Buscar por tipo (INCOME/EXPENSE)
  - `findByUserIdAndParentIdIsNull`: Buscar categorias principais
  - `findByUserIdAndParentId`: Buscar subcategorias
  - `existsByUserIdAndNameAndType`: Verificar duplicatas

#### 3. Service
- **Arquivo**: `qfin-backend/qfin-backend/src/main/java/com/qfin/qfinbackend/service/CategoryService.java`
- **Funcionalidades**:
  - CRUD completo de categorias
  - Validações de hierarquia (previne referências circulares)
  - Proteção de categorias padrão
  - Inicialização automática de categorias padrão para novos usuários

#### 4. Controller
- **Arquivo**: `qfin-backend/qfin-backend/src/main/java/com/qfin/qfinbackend/controller/CategoryController.java`
- **Endpoints REST**:
  - `GET /api/categories` - Listar todas as categorias do usuário
  - `GET /api/categories/type/{type}` - Listar por tipo
  - `GET /api/categories/main` - Listar categorias principais
  - `GET /api/categories/{parentId}/subcategories` - Listar subcategorias
  - `GET /api/categories/{id}` - Obter categoria específica
  - `POST /api/categories` - Criar nova categoria
  - `PUT /api/categories/{id}` - Atualizar categoria
  - `DELETE /api/categories/{id}` - Deletar categoria
  - `POST /api/categories/initialize` - Inicializar categorias padrão

#### 5. Banco de Dados
- **Arquivo**: `categories-setup.sql`
- **Tabela**: `categories`
- **Índices**: Criados para otimizar consultas por userId, type e parentId

#### 6. Integração
- **AuthController**: Atualizado para inicializar categorias padrão no registro
- **SecurityConfig**: Rotas de categorias adicionadas à configuração de segurança

### Frontend (React/TypeScript)

#### 1. Types
- **Arquivo**: `qfin-frontend/src/types/index.ts`
- **Interfaces**:
  - `Category`: Representa uma categoria
  - `CreateCategoryRequest`: Dados para criar categoria
  - `UpdateCategoryRequest`: Dados para atualizar categoria

#### 2. Service
- **Arquivo**: `qfin-frontend/src/services/categories.service.ts`
- **Métodos**:
  - `getAllCategories()`: Buscar todas as categorias
  - `getCategoriesByType(type)`: Buscar por tipo
  - `getMainCategories()`: Buscar categorias principais
  - `getSubcategories(parentId)`: Buscar subcategorias
  - `getCategoryById(id)`: Buscar categoria específica
  - `createCategory(data)`: Criar nova categoria
  - `updateCategory(id, data)`: Atualizar categoria
  - `deleteCategory(id)`: Deletar categoria
  - `initializeDefaultCategories()`: Inicializar categorias padrão

#### 3. API Service
- **Arquivo**: `qfin-frontend/src/services/api.service.ts`
- **Melhorias**: Adicionados métodos genéricos (get, post, put, delete)

## Categorias Padrão

### Receitas (INCOME)
1. Salário
2. Freelance
3. Investimentos
4. Aluguel
5. Outros

### Despesas (EXPENSE)
1. Alimentação
2. Transporte
3. Moradia
4. Saúde
5. Educação
6. Lazer
7. Compras
8. Outros

## Próximos Passos

### Pendente de Implementação

1. **Componentes Frontend**:
   - [ ] `category-manager.tsx` - Gerenciador de categorias
   - [ ] Atualizar `transaction-form.tsx` - Usar categorias da API
   - [ ] Atualizar `Goals.tsx` - Usar categorias da API

2. **Páginas Frontend**:
   - [ ] `Categories.tsx` - Página de gerenciamento
   - [ ] Atualizar `App.tsx` - Adicionar rota
   - [ ] Atualizar `header.tsx` - Adicionar link

3. **Testes**:
   - [ ] Testar criação de categorias
   - [ ] Testar criação de subcategorias
   - [ ] Testar uso em transações
   - [ ] Testar uso em metas

## Como Usar

### 1. Configurar Banco de Dados

```bash
# Execute o script SQL
psql -U postgres -d quickfinance -f categories-setup.sql
```

### 2. Iniciar Backend

```bash
cd qfin-backend/qfin-backend
mvn spring-boot:run
```

### 3. Iniciar Frontend

```bash
cd qfin-frontend
npm run dev
```

### 4. Testar API

#### Criar Categoria
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Supermercado",
    "type": "EXPENSE",
    "parentId": null
  }'
```

#### Criar Subcategoria
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frutas",
    "type": "EXPENSE",
    "parentId": 1
  }'
```

#### Listar Categorias
```bash
curl -X GET http://localhost:8080/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Validações Implementadas

1. **Duplicatas**: Não permite categorias com mesmo nome e tipo para o mesmo usuário
2. **Hierarquia**: Valida que categoria pai existe e pertence ao usuário
3. **Tipo**: Categoria pai deve ser do mesmo tipo (INCOME/EXPENSE)
4. **Referência Circular**: Previne que categoria seja sua própria pai
5. **Proteção**: Categorias padrão não podem ser editadas ou deletadas
6. **Dependências**: Não permite deletar categoria com subcategorias

## Estrutura de Dados

```json
{
  "id": 1,
  "name": "Alimentação",
  "type": "EXPENSE",
  "parentId": null,
  "isDefault": true,
  "userId": 1
}
```

## Observações Importantes

1. **Categorias Padrão**: São criadas automaticamente no registro do usuário
2. **Hierarquia**: Suporta apenas um nível de subcategorias (categoria -> subcategoria)
3. **Segurança**: Todas as rotas requerem autenticação JWT
4. **Validação**: Backend valida todas as operações antes de persistir

## Erros Comuns

### Backend
- **"Category with this name already exists"**: Nome duplicado para o mesmo tipo
- **"Parent category not found"**: ID da categoria pai inválido
- **"Cannot update default categories"**: Tentativa de editar categoria padrão
- **"Cannot delete category with subcategories"**: Categoria tem dependências

### Frontend
- **"Failed to fetch categories"**: Erro de autenticação ou conexão
- **"Failed to create category"**: Dados inválidos ou duplicados

## Suporte

Para dúvidas ou problemas, consulte:
- README.md
- GUIA-INICIALIZACAO.md
- TODO-CATEGORIAS.md
