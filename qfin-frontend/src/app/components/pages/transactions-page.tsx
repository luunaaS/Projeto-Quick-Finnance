import { useState } from 'react';
import { Search, Filter, Plus, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TransactionForm } from '../transaction-form';
import { TransactionList } from '../transaction-list';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface TransactionsPageProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionsPage({ 
  transactions, 
  onAddTransaction, 
  onDeleteTransaction 
}: TransactionsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Obter categorias únicas
  const categories = Array.from(new Set(transactions.map(t => t.category)));

  // Filtrar transações
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Calcular estatísticas das transações filtradas
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            Transações
          </h1>
          <p style={{ color: '#6B7280' }}>
            Gerencie todas as suas receitas e despesas
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#1E3A8A' }}
          className="hover:bg-blue-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Total de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#059669' }}>
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Total de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Saldo Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-2xl font-bold"
              style={{ color: balance >= 0 ? '#059669' : '#DC2626' }}
            >
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de nova transação */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#1E3A8A' }}>Nova Transação</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm 
              onAddTransaction={(transaction) => {
                onAddTransaction(transaction);
                setShowForm(false);
              }} 
            />
          </CardContent>
        </Card>
      )}

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#1E3A8A' }}>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#6B7280' }} />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterCategory('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de transações */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#1E3A8A' }}>
            Transações ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList 
            transactions={filteredTransactions}
            onDeleteTransaction={onDeleteTransaction}
          />
        </CardContent>
      </Card>
    </div>
  );
}