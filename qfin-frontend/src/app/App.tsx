import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/header';
import { DashboardPage } from './components/pages/dashboard-page';
import { TransactionsPage } from './components/pages/transactions-page';
import { FinancingPage } from './components/pages/financing-page';
import { ReportsPage } from './components/pages/reports-page';
import { HelpPage } from './components/help-page';
import { InvestmentsPage } from './components/pages/investments-page';
import { RecurringTransactionsPage } from './components/pages/recurring-transactions-page';
import { MultiCurrencyPage } from './components/pages/multi-currency-page';
import { ProfilePage } from './components/pages/profile-page';
import { CategoriesPage } from './components/pages/categories-page';
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
  const [loginForm, setLoginForm] = useState({ email: '', password: '', name: '', cpf: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    birthDate: '',
    profileImageBase64: null as string | null,
  });

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
      const [transactionsData, financingsData] = await Promise.all([
        api.getTransactions(),
        api.getFinancings(),
      ]);

      const mappedTransactions = transactionsData.map((t: any) => ({
        id: t.id.toString(),
        type: t.type.toLowerCase() as 'income' | 'expense',
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
      }));

      setTransactions(mappedTransactions);

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

  // Read reset token from URL (password recovery link from email)
  const [hasResetTokenInUrl, setHasResetTokenInUrl] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlResetToken = params.get('resetToken');
    if (urlResetToken) {
      // Force the login/reset screen even if a session exists
      api.clearToken();
      setIsAuthenticated(false);
      setResetToken(urlResetToken);
      setIsResetPassword(true);
      setHasResetTokenInUrl(true);
      // Clean the token from the URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    if (hasResetTokenInUrl) {
      setIsLoading(false);
      return;
    }
    const token = api.getToken();
    if (token) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [loadData, hasResetTokenInUrl]);

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
      setCurrentPage('dashboard');
      setLoginForm({ email: '', password: '', name: '', cpf: '' });
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
        email: response?.user?.email || loginForm.email,
        phone: '',
        bio: '',
        birthDate: '',
        profileImageBase64: null,
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
      const response = await api.register(loginForm.name, loginForm.email, loginForm.password, loginForm.cpf || undefined);
      setCurrentUser({
        name: response?.user?.name || loginForm.name,
        email: response?.user?.email || loginForm.email,
        phone: '',
        bio: '',
        birthDate: '',
        profileImageBase64: null,
      });
      setIsAuthenticated(true);
      loadData();
    } catch (error: any) {
      const msg = error?.message || '';
      try { const parsed = JSON.parse(msg); setAuthError(parsed.error || 'Erro ao registrar.'); }
      catch { setAuthError(msg || 'Erro ao registrar. Verifique os dados e tente novamente.'); }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const response = await api.forgotPassword(loginForm.email);
      setAuthSuccess(response.message || 'Verifique seu email.');
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setIsResetPassword(true);
        setIsForgotPassword(false);
      }
    } catch (error: any) {
      setAuthError('Erro ao solicitar recuperação. Tente novamente.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const response = await api.resetPassword(resetToken, loginForm.password);
      setAuthSuccess(response.message || 'Senha redefinida com sucesso!');
      setTimeout(() => { setIsResetPassword(false); setIsForgotPassword(false); setAuthSuccess(''); }, 2000);
    } catch (error: any) {
      const msg = error?.message || '';
      try { const parsed = JSON.parse(msg); setAuthError(parsed.error || 'Erro ao redefinir senha.'); }
      catch { setAuthError(msg || 'Erro ao redefinir senha.'); }
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

  const handleRegisterFinancingPayment = async (financingId: string, amount: number) => {
    try {
      const updated = await api.registerFinancingPayment(financingId, amount);
      setFinancings(prev =>
        prev.map(f =>
          f.id === financingId
            ? {
                ...f,
                remainingAmount: updated.remainingAmount,
              }
            : f
        )
      );
    } catch (error) {
      console.error('Error registering financing payment:', error);
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
                {isResetPassword ? 'Redefinir senha' : isForgotPassword ? 'Recuperar senha' : isRegistering ? 'Crie sua conta' : 'Faça login para continuar'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                {authSuccess}
              </div>
            )}

            {isResetPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Token de recuperação</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB' }}
                    placeholder="Cole o token recebido"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Nova senha</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB' }}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1E3A8A' }}>
                  Redefinir senha
                </button>
              </form>
            ) : isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Email cadastrado</label>
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
                <button type="submit" className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1E3A8A' }}>
                  Enviar link de recuperação
                </button>
              </form>
            ) : (
              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                {isRegistering && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Nome completo *</label>
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
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>CPF (opcional)</label>
                      <input
                        type="text"
                        value={loginForm.cpf}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, cpf: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: '#D1D5DB' }}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Email *</label>
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
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Senha * {isRegistering && <span className="text-gray-400 font-normal">(mín. 6 caracteres)</span>}</label>
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
                {!isRegistering && (
                  <div className="text-right">
                    <button type="button" onClick={() => { setIsForgotPassword(true); setAuthError(''); setAuthSuccess(''); }} className="text-sm hover:underline" style={{ color: '#1E3A8A' }}>
                      Esqueci minha senha
                    </button>
                  </div>
                )}
                <button type="submit" className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1E3A8A' }}>
                  {isRegistering ? 'Registrar' : 'Entrar'}
                </button>
              </form>
            )}

            <div className="mt-4 text-center space-y-2">
              {(isForgotPassword || isResetPassword) ? (
                <button onClick={() => { setIsForgotPassword(false); setIsResetPassword(false); setAuthError(''); setAuthSuccess(''); }} className="text-sm hover:underline" style={{ color: '#1E3A8A' }}>
                  Voltar ao login
                </button>
              ) : (
                <>
                  <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); setAuthSuccess(''); }} className="text-sm hover:underline block w-full" style={{ color: '#1E3A8A' }}>
                    {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
                  </button>
                  {isResetPassword || isForgotPassword ? null : (
                    <button onClick={() => { setIsResetPassword(true); setAuthError(''); setAuthSuccess(''); }} className="text-sm hover:underline block w-full" style={{ color: '#6B7280' }}>
                      Já tenho um token de recuperação
                    </button>
                  )}
                </>
              )}
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
            onRegisterPayment={handleRegisterFinancingPayment}
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
      case 'categories':
        return <CategoriesPage />;
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
      <Header currentPage={currentPage} onNavigate={setCurrentPage} currentUser={currentUser} />
      <main className="container mx-auto px-6 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
}
