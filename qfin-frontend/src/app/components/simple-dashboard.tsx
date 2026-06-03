import { DashboardCards } from './dashboard-cards';
import { FinancialChart } from './financial-chart';
import { Bell, TrendingUp, Repeat, Globe, ArrowRight } from 'lucide-react';

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

interface SimpleDashboardProps {
  transactions: Transaction[];
  financings: Financing[];
}

export function SimpleDashboard({ transactions, financings }: SimpleDashboardProps) {
  // Garantir que os dados estão sempre válidos
  const safeTransactions = transactions || [];
  const safeFinancings = financings || [];

  // Calcular resumo financeiro
  const totalIncome = safeTransactions
    .filter((t) => t && t.type === "income" && typeof t.amount === 'number')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = safeTransactions
    .filter((t) => t && t.type === "expense" && typeof t.amount === 'number')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-8">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
          Dashboard QFin
        </h1>
        <p style={{ color: '#6B7280' }}>
          Visão geral das suas finanças pessoais
        </p>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        financings={safeFinancings.length}
      />


      {/* Acesso Rápido às Novas Funcionalidades */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#1E3A8A' }}>
              Acesso Rápido - Novos Recursos
            </h2>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
              Explore as funcionalidades recém-implementadas do QFin
            </p>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#059669', color: 'white' }}>
            Novembro 2026
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'notifications' }));
            }}
            className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: '#E5E7EB' }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#DC262620', color: '#DC2626' }}
              >
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: '#1E3A8A' }}>
                  Notificações
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Lembretes de contas e alertas
                </p>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: '#6B7280' }} />
            </div>
          </a>

          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'recurring' }));
            }}
            className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: '#E5E7EB' }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#1E3A8A20', color: '#1E3A8A' }}
              >
                <Repeat className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: '#1E3A8A' }}>
                  Recorrentes
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Transações automáticas
                </p>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: '#6B7280' }} />
            </div>
          </a>

          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'multicurrency' }));
            }}
            className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: '#E5E7EB' }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F59E0B20', color: '#F59E0B' }}
              >
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: '#1E3A8A' }}>
                  Multi-moeda
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Transações internacionais
                </p>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: '#6B7280' }} />
            </div>
          </a>

          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'investments' }));
            }}
            className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: '#E5E7EB' }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#05966920', color: '#059669' }}
              >
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1" style={{ color: '#1E3A8A' }}>
                  Investimentos
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Acompanhe seu portfólio
                </p>
              </div>
              <ArrowRight className="h-4 w-4" style={{ color: '#6B7280' }} />
            </div>
          </a>
        </div>
      </div>

      {/* Gráficos */}
      <FinancialChart transactions={safeTransactions} />

      {/* Lista simples de transações */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#1E3A8A' }}>
          Transações Recentes
        </h2>
        {safeTransactions.length > 0 ? (
          <div className="space-y-2">
            {safeTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{transaction.category}</p>
                </div>
                <div className="text-right">
                  <p 
                    className="font-bold"
                    style={{ color: transaction.type === 'income' ? '#059669' : '#DC2626' }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8" style={{ color: '#6B7280' }}>
            Nenhuma transação encontrada
          </p>
        )}
      </div>

      {/* Financiamentos simples */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#1E3A8A' }}>
          Financiamentos
        </h2>
        {safeFinancings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {safeFinancings.map((financing) => (
              <div key={financing.id} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{financing.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{financing.type}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Restante:</span>
                    <span className="font-medium" style={{ color: '#DC2626' }}>
                      R$ {financing.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Parcela:</span>
                    <span className="font-medium">
                      R$ {financing.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8" style={{ color: '#6B7280' }}>
            Nenhum financiamento encontrado
          </p>
        )}
      </div>
    </div>
  );
}