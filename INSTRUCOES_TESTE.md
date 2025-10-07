# Instruções de Teste - Quick Finance

## ⚠️ Nota Importante
Devido a limitações do ambiente de desenvolvimento, os testes automatizados não puderam ser completados. 
Siga estas instruções para testar manualmente o projeto.

## 🔧 Pré-requisitos
- Java 17 ou superior
- Node.js 16 ou superior
- Maven (incluído no projeto via mvnw)

## 📝 Testes Manuais

### 1. Backend (Spring Boot)

#### Passo 1: Compilar o Projeto
```bash
cd qfin-backend/qfin-backend
./mvnw clean install -DskipTests
```

**Resultado Esperado:** BUILD SUCCESS

#### Passo 2: Iniciar o Servidor
```bash
./mvnw spring-boot:run
```

**Resultado Esperado:**
- Servidor iniciado na porta 8080
- Mensagem: "Started QfinBackendApplication"
- H2 Console disponível em: http://localhost:8080/h2-console

#### Passo 3: Testar Endpoints com Curl

**3.1 Registrar Usuário**
```bash
curl -X POST http://localhost:8080/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Teste User\",\"email\":\"teste@email.com\",\"password\":\"senha123\"}"
```

**Resultado Esperado:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Teste User",
    "email": "teste@email.com"
  }
}
```

**3.2 Fazer Login**
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teste@email.com\",\"password\":\"senha123\"}"
```

**Resultado Esperado:** Mesmo formato do registro

**3.3 Criar Transação (use o token recebido)**
```bash
curl -X POST http://localhost:8080/api/transactions ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN_AQUI" ^
  -d "{\"type\":\"INCOME\",\"amount\":1000.00,\"category\":\"Salário\",\"description\":\"Salário mensal\",\"date\":\"2024-01-15\"}"
```

**Resultado Esperado:**
```json
{
  "id": 1,
  "type": "INCOME",
  "amount": 1000.00,
  "category": "Salário",
  "description": "Salário mensal",
  "date": "2024-01-15"
}
```

**3.4 Listar Transações**
```bash
curl -X GET http://localhost:8080/api/transactions ^
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**3.5 Criar Financiamento**
```bash
curl -X POST http://localhost:8080/api/financings ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN_AQUI" ^
  -d "{\"name\":\"Carro\",\"totalAmount\":50000.00,\"remainingAmount\":35000.00,\"monthlyPayment\":890.00,\"type\":\"CAR_FINANCING\",\"endDate\":\"2026-12-31\"}"
```

**3.6 Listar Financiamentos**
```bash
curl -X GET http://localhost:8080/api/financings ^
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 2. Frontend (React + Vite)

#### Passo 1: Instalar Dependências
```bash
cd qfin-frontend
npm install
```

**Resultado Esperado:** Todas as dependências instaladas sem erros

#### Passo 2: Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

**Resultado Esperado:**
- Servidor iniciado na porta 5173
- Mensagem: "Local: http://localhost:5173/"

#### Passo 3: Testar no Navegador

**3.1 Acessar a Aplicação**
- Abra: http://localhost:5173
- Deve redirecionar para: http://localhost:5173/login

**3.2 Testar Registro**
1. Clique em "Criar conta"
2. Preencha:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: senha123
3. Clique em "Registrar"
4. Deve redirecionar para o Dashboard

**3.3 Testar Logout e Login**
1. Clique no avatar no canto superior direito
2. Clique em "Sair"
3. Deve voltar para a tela de login
4. Faça login com as credenciais criadas
5. Deve entrar no Dashboard

**3.4 Testar Página de Transações**
1. Clique em "Transações" no menu
2. Deve abrir a página de transações
3. Teste adicionar uma receita:
   - Tipo: Receita
   - Valor: 5000
   - Categoria: Salário
   - Descrição: Salário mensal
   - Data: Hoje
4. Clique em "Adicionar Transação"
5. A transação deve aparecer na lista

**3.5 Testar Filtros de Transações**
1. Adicione uma despesa também
2. Teste os filtros: Todas / Receitas / Despesas
3. Verifique se os cards de resumo atualizam

**3.6 Testar Página de Financiamentos**
1. Clique em "Financiamentos" no menu
2. Clique em "Adicionar"
3. Preencha os dados:
   - Nome: Financiamento do Carro
   - Valor Total: 50000
   - Valor Restante: 35000
   - Parcela Mensal: 890
   - Tipo: Veículo
   - Data de Término: 31/12/2026
4. Clique em "Adicionar Financiamento"
5. O financiamento deve aparecer na lista

**3.7 Testar Página de Perfil**
1. Clique no avatar no canto superior direito
2. Clique em "Perfil"
3. Verifique se seus dados aparecem corretamente
4. Teste o botão "Editar Perfil"

**3.8 Testar Navegação**
1. Teste todos os links do menu
2. Verifique se a página ativa fica destacada
3. Teste voltar ao Dashboard clicando no logo

## ✅ Checklist de Testes

### Backend
- [ ] Projeto compila sem erros
- [ ] Servidor inicia na porta 8080
- [ ] Endpoint de registro funciona
- [ ] Endpoint de login funciona
- [ ] Token JWT é gerado
- [ ] Endpoints protegidos exigem autenticação
- [ ] CRUD de transações funciona
- [ ] CRUD de financiamentos funciona
- [ ] Filtros por usuário funcionam

### Frontend
- [ ] Dependências instalam sem erros
- [ ] Servidor inicia na porta 5173
- [ ] Página de login carrega
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Token é armazenado no localStorage
- [ ] Logout funciona
- [ ] Proteção de rotas funciona
- [ ] Dashboard carrega
- [ ] Página de Transações funciona
- [ ] Adicionar transação funciona
- [ ] Deletar transação funciona
- [ ] Filtros de transações funcionam
- [ ] Página de Financiamentos funciona
- [ ] Adicionar financiamento funciona
- [ ] Página de Perfil funciona
- [ ] Navegação entre páginas funciona
- [ ] Indicador de página ativa funciona

### Integração
- [ ] Frontend se comunica com backend
- [ ] CORS funciona corretamente
- [ ] Token JWT é enviado nas requisições
- [ ] Erros de API são tratados
- [ ] Dados persistem no banco H2

## 🐛 Problemas Conhecidos

1. **Lombok**: Se houver erros de compilação relacionados a getters/setters:
   - Certifique-se de que o Lombok está instalado na IDE
   - Execute: `./mvnw clean install -U`

2. **CORS**: Se houver erros de CORS:
   - Verifique se o backend está rodando na porta 8080
   - Verifique se o frontend está rodando na porta 5173

3. **H2 Database**: Os dados são perdidos ao reiniciar o backend
   - Isso é esperado (banco em memória)
   - Para produção, configure um banco persistente

## 📊 Resultados Esperados

Após completar todos os testes, você deve ter:
- ✅ Backend rodando e respondendo a requisições
- ✅ Frontend rodando e exibindo todas as páginas
- ✅ Autenticação funcionando (registro, login, logout)
- ✅ CRUD de transações funcionando
- ✅ CRUD de financiamentos funcionando
- ✅ Navegação entre páginas funcionando
- ✅ Dados sendo salvos e recuperados corretamente

## 🎉 Conclusão

Se todos os testes passarem, o projeto está funcionando corretamente e pronto para uso!

Para mais informações, consulte:
- SETUP.md - Instruções de execução
- PROJETO_COMPLETO.md - Documentação completa do projeto
- TODO.md - Próximos passos e melhorias
