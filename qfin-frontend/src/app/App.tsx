import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/header';
import { DashboardPage } from './components/pages/dashboard-page';
import { TransactionsPage } from './components/pages/transactions-page';
import { FinancingPage } from './components/pages/financing-page';
import { ReportsPage } from './components/pages/reports-page';
import { HelpPage } from './components/help-page';
import { NotificationsPage } from './components/pages/notifications-page';
import { InvestmentsPage } from './components/pages/investments-page';
import { RecurringTransactionsPage } from './components/pages/recurring-transactions-page';
import { MultiCurrencyPage } from './components/pages/multi-currency-page';
import { ProfilePage } from './components/pages/profile-page';
import api from '../services/api';

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

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financings, setFinancings] = useState<Financing[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState({ name: '', email: '' });

  const mapFinancingType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'MORTGAGE': 'Imóvel',
      'CAR_FINANCING': 'Veículo',
      'PERSONAL_LOAN': 'Pessoal',
      'STUDENT_LOAN': 'Estudantil',
      'LOAN': 'Empréstimo',
      'OTHER': 'Outro',
    };
    return typeMap[type] || type;
  };

  const mapFinancingTypeToBackend = (type: string): string => {
    const typeMap: Record<string, string> = {
      'Imóvel': 'MORTGAGE',
      'Casa': 'MORTGAGE',
      'Veículo': 'CAR_FINANCING',
      'Carro': 'CAR_FINANCING',
      'Pessoal': 'PERSONAL_LOAN',
      'Estudantil': 'STUDENT_LOAN',
      'Empréstimo': 'LOAN',
      'Outro': 'OTHER',
    };
    return typeMap[type] || 'OTHER';
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [transactionsData, financingsData, recurringData] = await Promise.all([
        api.getTransactions(),
        api.getFinancings(),
        api.getRecurringTransactions(),
      ]);

      const mappedTransactions = transactionsData.map((t: any) => ({
        id: t.id.toString(),
        type: t.type.toLowerCase() as 'income' | 'expense',
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
      }));

      const recurringSynthetic = (recurringData || [])
        .filter((r: any) => r && r.isActive)
        .map((r: any) => ({
          id: `recurring-${r.id}`,
          type: (r.type || '').toLowerCase() as 'income' | 'expense',
          amount: Number(r.amount) || 0,
          category: r.category || 'Recorrente',
          description: `${r.name || 'Recorrente'} (Recorrente)`,
          date: r.nextProcessing || new Date().toISOString().slice(0, 10),
        }));

      setTransactions([...recurringSynthetic, ...mappedTransactions]);

      setFinancings(financingsData.map((f: any) => ({
        id: f.id.toString(),
        name: f.name,
        totalAmount: f.totalAmount,
        remainingAmount: f.remainingAmount,
        monthlyPayment: f.monthlyPayment,
        type: mapFinancingType(f.type),
        endDate: f.endDate,
      })));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [loadData]);

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentPage(customEvent.detail);
      }
    };

    const handleLogout = () => {
      setIsAuthenticated(false);
      setTransactions([]);
      setFinancings([]);
    };

    window.addEventListener('navigate', handleNavigate);
    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('navigate', handleNavigate);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await api.login(loginForm.email, loginForm.password);
      setCurrentUser({
        name: response?.user?.name || '',
        email: loginForm.email,
      });
      setIsAuthenticated(true);
      loadData();
    } catch (error: any) {
      setAuthError('Email ou senha inválidos. Tente novamente.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await api.register(loginForm.name, loginForm.email, loginForm.password);
      setCurrentUser({
        name: response?.user?.name || loginForm.name,
        email: loginForm.email,
      });
      setIsAuthenticated(true);
      loadData();
    } catch (error: any) {
      setAuthError('Erro ao registrar. Verifique os dados e tente novamente.');
    }
  };

  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      const created = await api.createTransaction({
        type: newTransaction.type.toUpperCase(),
        amount: newTransaction.amount,
        category: newTransaction.category,
        description: newTransaction.description,
        date: newTransaction.date,
      });
      setTransactions(prev => [{
        id: created.id.toString(),
        type: created.type.toLowerCase() as 'income' | 'expense',
        amount: created.amount,
        category: created.category,
        description: created.description,
        date: created.date,
      }, ...prev]);
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const addFinancing = async (newFinancing: Omit<Financing, 'id'>) => {
    try {
      const created = await api.createFinancing({
        name: newFinancing.name,
        totalAmount: newFinancing.totalAmount,
        remainingAmount: newFinancing.remainingAmount,
        monthlyPayment: newFinancing.monthlyPayment,
        type: mapFinancingTypeToBackend(newFinancing.type),
        endDate: newFinancing.endDate,
      });
      setFinancings(prev => [{
        id: created.id.toString(),
        name: created.name,
        totalAmount: created.totalAmount,
        remainingAmount: created.remainingAmount,
        monthlyPayment: created.monthlyPayment,
        type: mapFinancingType(created.type),
        endDate: created.endDate,
      }, ...prev]);
    } catch (error) {
      console.error('Error creating financing:', error);
    }
  };

  // Login/Register page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#1E3A8A' }}>
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>QFin</h1>
              </div>
              <p style={{ color: '#6B7280' }}>
                {isRegistering ? 'Crie sua conta' : 'Faça login para continuar'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                {authError}
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Nome</label>
                  <input
                    type="text"
                    value={loginForm.name}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB' }}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#D1D5DB' }}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Senha</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#D1D5DB' }}
                  placeholder="Sua senha"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#1E3A8A' }}
              >
                {isRegistering ? 'Registrar' : 'Entrar'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
                className="text-sm hover:underline"
                style={{ color: '#1E3A8A' }}
              >
                {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#1E3A8A' }}></div>
          <p className="mt-4" style={{ color: '#6B7280' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            transactions={transactions}
            financings={financings}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            onAddFinancing={addFinancing}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            transactions={transactions}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        );
      case 'financing':
        return (
          <FinancingPage
            financings={financings}
            onAddFinancing={addFinancing}
          />
        );
      case 'reports':
        return (
          <ReportsPage
            transactions={transactions}
            financings={financings}
          />
        );
      case 'help':
        return <HelpPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'investments':
        return <InvestmentsPage />;
      case 'recurring':
        return <RecurringTransactionsPage />;
      case 'multicurrency':
        return <MultiCurrencyPage />;
      case 'profile':
        return (
          <ProfilePage
            currentUser={currentUser}
            onUserUpdated={setCurrentUser}
          />
        );
      default:
        return (
          <DashboardPage
            transactions={transactions}
            financings={financings}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            onAddFinancing={addFinancing}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="container mx-auto px-6 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
}
