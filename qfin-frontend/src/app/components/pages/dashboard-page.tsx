import { DashboardCards } from "../dashboard-cards";
import { TransactionForm } from "../transaction-form";
import { TransactionList } from "../transaction-list";
import { FinancialChart } from "../financial-chart";
import { FinancingSection } from "../financing-section";

interface Transaction {
  id: string;
  type: "income" | "expense";
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

interface DashboardPageProps {
  transactions: Transaction[];
  financings: Financing[];
  onAddTransaction: (
    transaction: Omit<Transaction, "id">,
  ) => void;
  onDeleteTransaction: (id: string) => void;
  onAddFinancing: (financing: Omit<Financing, "id">) => void;
}

export function DashboardPage({
  transactions,
  financings,
  onAddTransaction,
  onDeleteTransaction,
  onAddFinancing,
}: DashboardPageProps) {
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

  // Mostrar apenas as últimas 5 transações no dashboard
  const recentTransactions = safeTransactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Cabeçalho da página */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ color: "#1E3A8A" }}
        >
          Dashboard
        </h1>
        <p style={{ color: "#6B7280" }}>
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

      {/* Gráficos */}
      <FinancialChart transactions={safeTransactions} />

      {/* Grid principal */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulário de transação */}
        <div className="lg:col-span-1">
          <TransactionForm
            onAddTransaction={onAddTransaction}
          />
        </div>

        {/* Lista de transações recentes */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-semibold"
                style={{ color: "#1E3A8A" }}
              >
                Transações Recentes
              </h2>
              {safeTransactions.length > 5 && (
                <p
                  className="text-sm"
                  style={{ color: "#6B7280" }}
                >
                  Mostrando 5 de {transactions.length}{" "}
                  transações
                </p>
              )}
            </div>
            <TransactionList
              transactions={recentTransactions}
              onDeleteTransaction={onDeleteTransaction}
            />
            {safeTransactions.length === 0 && (
              <div className="text-center py-8">
                <p style={{ color: "#6B7280" }}>
                  Nenhuma transação encontrada. Adicione sua
                  primeira transação usando o formulário ao
                  lado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção de financiamentos */}
      <FinancingSection
        financings={safeFinancings}
        onAddFinancing={onAddFinancing}
      />
    </div>
  );
}