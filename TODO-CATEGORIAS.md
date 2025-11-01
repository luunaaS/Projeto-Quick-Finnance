# TODO - Implementação de Categorias Personalizadas

## Backend

### 1. Modelo e Banco de Dados
- [x] Criar modelo Category.java
- [x] Criar script SQL para tabela categories
- [x] Adicionar categorias padrão no script

### 2. Repository
- [x] Criar CategoryRepository.java

### 3. Service
- [x] Criar CategoryService.java
- [x] Implementar CRUD de categorias
- [x] Implementar validações
- [x] Implementar criação de categorias padrão

### 4. Controller
- [x] Criar CategoryController.java
- [x] Implementar endpoints REST

### 5. Configuração
- [x] Atualizar SecurityConfig.java
- [x] Atualizar AuthController para inicializar categorias no registro

## Frontend

### 1. Types e Services
- [ ] Atualizar types/index.ts
- [ ] Criar categories.service.ts

### 2. Componentes
- [ ] Criar category-manager.tsx
- [ ] Atualizar transaction-form.tsx
- [ ] Atualizar Goals.tsx

### 3. Páginas
- [ ] Criar Categories.tsx
- [ ] Atualizar App.tsx
- [ ] Atualizar header.tsx

## Testes
- [ ] Testar criação de categorias
- [ ] Testar criação de subcategorias
- [ ] Testar uso em transações
- [ ] Testar uso em metas
