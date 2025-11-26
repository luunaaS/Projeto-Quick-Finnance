import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { DashboardCards } from '../components/dashboard-cards';
import { TransactionForm } from '../components/transaction-form';
import { TransactionList } from '../components/transaction-list';
import { FinancialChart } from '../components/financial-chart';
import { FinancingSection } from '../components/financing-section';
import { useAuth } from '../contexts/AuthContext';
import { transactionsService } from '../services/transactions.service';
import { financingService } from '../services/financing.service';
import type { Transaction, Financing } from '../types';

export function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financings, setFinancings] = useState<Financing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, financingsData] = await Promise.all([
        transactionsService.getTransactions(),
        financingService.getAllFinancings()
      ]);
      setTransactions(transactionsData);
      setFinancings(financingsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      const created = await transactionsService.createTransaction(newTransaction);
      if (created) {
        setTransactions(prev => [created, ...prev]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      const success = await transactionsService.deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const updateTransaction = async (id: number, updatedTransaction: Partial<Transaction>) => {
    try {
      const updated = await transactionsService.updateTransaction(id, updatedTransaction);
      if (updated) {
        setTransactions(prev => prev.map(t => t.id === id ? updated : t));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const addFinancing = async (newFinancing: Omit<Financing, 'id'>) => {
    try {
      const created = await financingService.createFinancing(newFinancing);
      if (created) {
        setFinancings(prev => [created, ...prev]);
      }
    } catch (error) {
      console.error('Error adding financing:', error);
    }
  };

  const updateFinancing = async (id: number, updatedFinancing: Partial<Financing>) => {
    try {
      const updated = await financingService.updateFinancing(id, updatedFinancing);
      if (updated) {
        setFinancings(prev => prev.map(f => f.id === id ? updated : f));
      }
    } catch (error) {
      console.error('Error updating financing:', error);
    }
  };

  const deleteFinancing = async (id: number) => {
    try {
      const success = await financingService.deleteFinancing(id);
      if (success) {
        setFinancings(prev => prev.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error('Error deleting financing:', error);
    }
  };

  // Calcular resumo financeiro
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <p className="text-center text-gray-500">Carregando dados...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Dashboard Cards */}
        <DashboardCards
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          financings={financings.length}
        />

        {/* Gráficos */}
        <FinancialChart transactions={transactions} />

        {/* Grid principal */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Formulário de transação */}
          <div className="lg:col-span-1">
            <TransactionForm onAddTransaction={addTransaction} />
          </div>

          {/* Lista de transações */}
          <div className="lg:col-span-2">
            <TransactionList 
              transactions={transactions} 
              onDeleteTransaction={deleteTransaction}
              onUpdateTransaction={updateTransaction}
            />
          </div>
        </div>

        {/* Seção de financiamentos */}
        <FinancingSection 
          financings={financings}
          onAddFinancing={addFinancing}
          onUpdateFinancing={updateFinancing}
          onDeleteFinancing={deleteFinancing}
        />
      </main>
    </div>
  );
}
