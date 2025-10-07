import { useState } from 'react';
import { Header } from '../components/header';
import { DashboardCards } from '../components/dashboard-cards';
import { TransactionForm } from '../components/transaction-form';
import { TransactionList } from '../components/transaction-list';
import { FinancialChart } from '../components/financial-chart';
import { FinancingSection } from '../components/financing-section';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Financing {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  type: string;
  endDate: string;
}

// Dados de exemplo
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    category: 'Salário',
    description: 'Salário mensal',
    date: '2024-01-15'
  },
  {
    id: '2',
    type: 'expense',
    amount: 150,
    category: 'Alimentação',
    description: 'Compras no supermercado',
    date: '2024-01-14'
  },
  {
    id: '3',
    type: 'expense',
    amount: 80,
    category: 'Transporte',
    description: 'Combustível',
    date: '2024-01-13'
  },
  {
    id: '4',
    type: 'income',
    amount: 500,
    category: 'Freelance',
    description: 'Projeto web',
    date: '2024-01-12'
  }
];

const sampleFinancings: Financing[] = [
  {
    id: '1',
    name: 'Financiamento do Carro',
    totalAmount: 50000,
    remainingAmount: 35000,
    monthlyPayment: 890,
    type: 'Veículo',
    endDate: '2026-12-31'
  },
  {
    id: '2',
    name: 'Casa Própria',
    totalAmount: 300000,
    remainingAmount: 250000,
    monthlyPayment: 1200,
    type: 'Imóvel',
    endDate: '2034-06-30'
  }
];

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [financings, setFinancings] = useState<Financing[]>(sampleFinancings);

  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addFinancing = (newFinancing: Omit<Financing, 'id'>) => {
    const financing: Financing = {
      ...newFinancing,
      id: Date.now().toString()
    };
    setFinancings(prev => [financing, ...prev]);
  };

  // Calcular resumo financeiro
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

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
            />
          </div>
        </div>

        {/* Seção de financiamentos */}
        <FinancingSection 
          financings={financings}
          onAddFinancing={addFinancing}
        />
      </main>
    </div>
  );
}
