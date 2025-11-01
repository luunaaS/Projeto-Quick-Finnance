# Guia de Relatórios - Quick Finance

## Visão Geral

A página de Relatórios permite visualizar, analisar e exportar dados financeiros de forma completa e organizada.

## Funcionalidades Implementadas

### 1. Filtros de Relatório
- **Data Início/Fim**: Selecione o período desejado para análise
- **Categoria**: Filtre por categoria específica (ex: Alimentação, Transporte)
- **Tipo**: Escolha entre Receitas, Despesas ou Todos

### 2. Cards de Resumo
Exibe métricas principais:
- **Total de Receitas**: Soma de todas as receitas no período
- **Total de Despesas**: Soma de todas as despesas no período
- **Saldo**: Diferença entre receitas e despesas
- **Total de Transações**: Quantidade de transações no período

### 3. Gráficos Interativos
- **Gráfico de Pizza - Receitas por Categoria**: Visualização da distribuição de receitas
- **Gráfico de Pizza - Despesas por Categoria**: Visualização da distribuição de despesas
- **Gráfico de Barras - Comparação**: Comparação visual entre receitas e despesas totais

### 4. Tabela Detalhada
Lista todas as transações do período com:
- Data
- Tipo (Receita/Despesa)
- Categoria
- Descrição
- Valor

### 5. Exportação de Dados

#### CSV (Comma-Separated Values)
- **Exportar Transações (CSV)**: Exporta todas as transações filtradas
- **Exportar Financiamentos (CSV)**: Exporta todos os financiamentos do usuário

#### PDF (Portable Document Format)
- **Exportar Relatório (PDF)**: Gera um relatório completo com resumo e transações

## Como Usar

### Acessando a Página de Relatórios
1. Faça login no sistema
2. Clique em "Relatórios" no menu de navegação
3. A página será carregada com dados do último mês

### Aplicando Filtros
1. Selecione a **Data Início** e **Data Fim**
2. (Opcional) Digite uma **Categoria** específica
3. Escolha o **Tipo** de transação
4. Clique em **Aplicar** para atualizar os dados
5. Use **Limpar** para resetar os filtros

### Exportando Dados

#### Para Exportar Transações em CSV:
1. Aplique os filtros desejados
2. Clique em "Exportar Transações (CSV)"
3. O arquivo será baixado automaticamente

#### Para Exportar Financiamentos em CSV:
1. Clique em "Exportar Financiamentos (CSV)"
2. O arquivo será baixado com todos os seus financiamentos

#### Para Exportar Relatório em PDF:
1. Aplique os filtros desejados
2. Clique em "Exportar Relatório (PDF)"
3. O arquivo PDF será baixado com o relatório completo

## Estrutura dos Arquivos Exportados

### CSV de Transações
```
Data,Tipo,Categoria,Descrição,Valor
01/01/2024,INCOME,Salário,Salário mensal,5000.00
05/01/2024,EXPENSE,Alimentação,Supermercado,350.00
```

### CSV de Financiamentos
```
Nome,Tipo,Valor Total,Valor Restante,Parcela Mensal,Data Final
Financiamento Carro,CAR_FINANCING,50000.00,30000.00,1200.00,31/12/2025
```

### PDF de Relatório
O PDF contém:
- Cabeçalho com período do relatório
- Resumo financeiro (receitas, despesas, saldo)
- Detalhamento por categoria
- Lista completa de transações

## Endpoints da API (Backend)

### Obter Transações Filtradas
```
POST /api/reports/transactions
Body: {
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "category": "Alimentação",
  "type": "EXPENSE"
}
```

### Obter Resumo
```
POST /api/reports/summary
Body: {
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "type": "ALL"
}
```

### Exportar Transações CSV
```
POST /api/reports/export/transactions/csv
Body: { filtros }
Response: arquivo CSV
```

### Exportar Financiamentos CSV
```
GET /api/reports/export/financings/csv
Response: arquivo CSV
```

### Exportar Relatório PDF
```
POST /api/reports/export/pdf
Body: { filtros }
Response: arquivo PDF
```

## Tecnologias Utilizadas

### Backend
- **Spring Boot**: Framework principal
- **Apache Commons CSV**: Geração de arquivos CSV
- **JPA Queries**: Consultas otimizadas ao banco de dados

### Frontend
- **React + TypeScript**: Interface do usuário
- **Recharts**: Biblioteca de gráficos
- **Axios**: Requisições HTTP
- **Shadcn/ui**: Componentes de UI

## Dicas de Uso

1. **Análise Mensal**: Use filtros de data para analisar mês a mês
2. **Categorias**: Filtre por categoria para entender onde está gastando mais
3. **Exportação Regular**: Exporte dados mensalmente para backup
4. **Gráficos**: Use os gráficos para identificar padrões de gastos
5. **Comparação**: Compare receitas vs despesas para manter o saldo positivo

## Solução de Problemas

### Nenhum dado aparece
- Verifique se há transações no período selecionado
- Confirme que os filtros estão corretos
- Tente limpar os filtros e aplicar novamente

### Erro ao exportar
- Verifique sua conexão com a internet
- Confirme que o backend está rodando
- Verifique o console do navegador para erros

### Gráficos não aparecem
- Certifique-se de que há dados no período
- Verifique se há transações com categorias definidas

## Próximas Melhorias Sugeridas

1. Gráfico de linha para evolução temporal
2. Comparação entre períodos
3. Metas vs Realizado
4. Exportação para Excel (XLSX)
5. Agendamento de relatórios automáticos
6. Envio de relatórios por email
7. Relatórios personalizados
8. Dashboard de análise avançada

## Suporte

Para dúvidas ou problemas, consulte:
- README.md principal do projeto
- Documentação da API
- Logs do backend e frontend
