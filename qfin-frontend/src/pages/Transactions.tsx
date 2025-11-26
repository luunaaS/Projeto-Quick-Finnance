import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { TransactionForm } from '../components/transaction-form';
import { TransactionList } from '../components/transaction-list';
import { useAuth } from '../contexts/AuthContext';
import { transactionsService } from '../services/transactions.service';
import type { Transaction } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export function Transactions() {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
    }
  }, [isAuthenticated]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      const created = await transactionsService.createTransaction(newTransaction);
      if (created) {
        setTransactions(prev => [created, ...prev]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const success = await transactionsService.deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleUpdateTransaction = async (id: number, updatedTransaction: Partial<Transaction>) => {
    try {
      const updated = await transactionsService.updateTransaction(id, updatedTransaction);
      if (updated) {
        setTransactions(prev => prev.map(t => t.id === id ? updated : t));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600 mt-2">Gerencie suas receitas e despesas</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para Filtros e Formulário */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter('all')}>
              Todas ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="income" onClick={() => setFilter('INCOME')}>
              Receitas ({transactions.filter(t => t.type === 'INCOME').length})
            </TabsTrigger>
            <TabsTrigger value="expense" onClick={() => setFilter('EXPENSE')}>
              Despesas ({transactions.filter(t => t.type === 'EXPENSE').length})
            </TabsTrigger>
          </TabsList>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Formulário */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Transação</CardTitle>
                  <CardDescription>Adicione uma nova receita ou despesa</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionForm onAddTransaction={handleAddTransaction} />
                </CardContent>
              </Card>
            </div>

            {/* Lista de Transações */}
            <div className="lg:col-span-2">
              {loading ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-gray-500">Carregando transações...</p>
                  </CardContent>
                </Card>
              ) : (
                <TransactionList 
                  transactions={filteredTransactions} 
                  onDeleteTransaction={handleDeleteTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                />
              )}
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
