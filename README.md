# Projeto Quick Finnance

## Descrição
O **Quick Finnance** é um sistema web simples e intuitivo para gerenciamento de finanças pessoais ou empresariais. Desenvolvido como um protótipo full-stack, ele permite que usuários registrem receitas e despesas, visualizem relatórios de saldo, categorizem transações e gerem gráficos básicos de gastos. Ideal para quem busca uma ferramenta rápida para controlar o orçamento sem complexidades excessivas.

O projeto foi criado com foco em usabilidade, utilizando tecnologias web modernas para uma interface responsiva que funciona em desktops e dispositivos móveis. A arquitetura segue o padrão de aplicação de página única (SPA) com um backend robusto, demonstrando conceitos de frontend, backend e persistência de dados.

### Funcionalidades Principais
- **Autenticação de Usuários**: Login e registro seguro para múltiplos perfis.
- **Gerenciamento de Transações**: Adicionar, editar e excluir receitas/despesas com categorias (ex.: alimentação, transporte, salário).
- **Dashboard Financeiro**: Visão geral de saldo atual, histórico mensal e alertas para gastos excessivos.
- **Relatórios e Gráficos**: Geração de resumos visuais (usando bibliotecas como Chart.js) para análise de tendências.
- **Exportação de Dados**: Download de relatórios em CSV para integração com planilhas.

O sistema prioriza simplicidade: sem integrações externas complexas (ex.: APIs bancárias), mas expansível para futuras melhorias como notificações por email ou suporte a múltiplas moedas.

## Tecnologias Utilizadas
- **Frontend**: HTML, CSS, TypeScript e JavaScript.
- **Backend**: Java 17 com Spring Boot para o servidor e API REST.
- **Banco de Dados**: PostgreSQL para ambiente de produção e H2 para desenvolvimento e testes.
- **Outras Ferramentas**: 
  - Chart.js para visualizações gráficas.
  - Nodemon para desenvolvimento local.
  - Git para versionamento.

Para mais detalhes, veja a seção de análise de linguagens no histórico do projeto ou execute `npm list` após instalação.

## Pré-requisitos
- Java JDK 17 instalado.
- Maven para gerenciamento de dependências do backend.
- Node.js (versão 18 ou superior) para o ambiente de frontend.
- Git para clonar o repositório.
- Um editor de código como VS Code.
- Navegador web moderno (Chrome, Firefox).

## Instalação
1. Clone o repositório:
