# Documentação Técnica - Quick Finnance

## 1. Visão Geral do Projeto

O **Quick Finnance** é um sistema web de gerenciamento financeiro pessoal, projetado para ser simples e intuitivo. Ele permite que os usuários controlem suas finanças registrando receitas e despesas, categorizando transações, definindo metas financeiras e visualizando relatórios detalhados. A aplicação foi desenvolvida como um projeto full-stack, utilizando Java com Spring Boot para o backend e React com TypeScript para o frontend.

## 2. Arquitetura do Sistema

A aplicação segue uma arquitetura de microsserviços desacoplada, com um frontend de página única (SPA) que consome uma API RESTful do backend.

### 2.1. Backend (qfin-backend)

O backend é uma aplicação Spring Boot que expõe uma API REST para o frontend. Ele é responsável por toda a lógica de negócios, incluindo autenticação de usuários, gerenciamento de dados e geração de relatórios.

- **Linguagem**: Java 17
- **Framework**: Spring Boot 3.2.5
- **Principais Módulos**:
    - **Controllers**: Gerenciam as requisições HTTP e a comunicação com os serviços.
    - **Services**: Contêm a lógica de negócios da aplicação.
    - **Repositories**: Interface com o banco de dados usando Spring Data JPA.
    - **Models**: Representam as entidades do banco de dados.
    - **Security**: Configuração de segurança com Spring Security e JWT.

### 2.2. Frontend (qfin-frontend)

O frontend é uma aplicação React (SPA) que fornece a interface do usuário. Ele se comunica com o backend através de requisições HTTP para a API REST.

- **Linguagem**: TypeScript
- **Framework**: React 18.3.1
- **Principais Módulos**:
    - **Pages**: Componentes que representam as páginas da aplicação.
    - **Components**: Componentes de UI reutilizáveis.
    - **Services**: Funções para fazer chamadas à API do backend.
    - **Contexts**: Gerenciamento de estado global da aplicação.

## 3. Tecnologias Utilizadas

| Categoria      | Tecnologia/Ferramenta        |
|----------------|------------------------------|
| **Backend**    | Java 17, Spring Boot, Maven  |
| **Frontend**   | React, TypeScript, Vite      |
| **Banco de Dados** | PostgreSQL, H2               |
| **UI**         | Tailwind CSS, Radix UI       |
| **Gráficos**   | Recharts                     |
| **Testes**     | JUnit 5, Mockito             |
| **Segurança**  | Spring Security, JWT         |

## 4. Esquema do Banco de Dados

O banco de dados relacional é composto pelas seguintes tabelas principais:

- `users`: Armazena as informações dos usuários.
- `categories`: Armazena as categorias de transações.
- `transactions`: Armazena as transações financeiras (receitas e despesas).
- `financings`: Armazena informações sobre financiamentos.
- `goals`: Armazena as metas financeiras dos usuários.

## 5. Endpoints da API

A seguir, uma descrição dos principais endpoints da API REST.

### 5.1. Autenticação (`/api/auth`)

- `POST /api/auth/register`: Registra um novo usuário.
- `POST /api/auth/login`: Autentica um usuário e retorna um token JWT.

### 5.2. Transações (`/api/transactions`)

- `GET /`: Retorna todas as transações do usuário autenticado.
- `GET /{id}`: Retorna uma transação específica.
- `POST /`: Cria uma nova transação.
- `PUT /{id}`: Atualiza uma transação existente.
- `DELETE /{id}`: Exclui uma transação.

### 5.3. Categorias (`/api/categories`)

- `GET /`: Retorna todas as categorias do usuário.
- `POST /`: Cria uma nova categoria.

### 5.4. Financiamentos (`/api/financings`)

- `GET /`: Retorna todos os financiamentos do usuário.
- `POST /`: Cria um novo financiamento.

### 5.5. Metas (`/api/goals`)

- `GET /`: Retorna todas as metas do usuário.
- `POST /`: Cria uma nova meta.

## 6. Instalação e Execução

### 6.1. Pré-requisitos

- Java JDK 17
- Maven
- Node.js e npm
- PostgreSQL

### 6.2. Backend

1. Navegue até a pasta `qfin-backend/qfin-backend`.
2. Configure o arquivo `application.properties` com as credenciais do seu banco de dados PostgreSQL.
3. Execute `mvn spring-boot:run` para iniciar o servidor.

### 6.3. Frontend

1. Navegue até a pasta `qfin-frontend`.
2. Execute `npm install` para instalar as dependências.
3. Execute `npm run dev` para iniciar o servidor de desenvolvimento.

## 7. Testes

Para executar os testes do backend, navegue até a pasta `qfin-backend/qfin-backend` e execute o comando `mvn test`.
