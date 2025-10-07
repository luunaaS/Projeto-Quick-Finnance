import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface DashboardCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  financings: number;
}

export function DashboardCards({ totalBalance, totalIncome, totalExpenses, financings }: DashboardCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
            Saldo Total
          </CardTitle>
          <Wallet className="h-4 w-4" style={{ color: '#1E3A8A' }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Atualizado agora
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
            Receitas
          </CardTitle>
          <TrendingUp className="h-4 w-4" style={{ color: '#059669' }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: '#059669' }}>
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Este mês
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
            Despesas
          </CardTitle>
          <TrendingDown className="h-4 w-4" style={{ color: '#DC2626' }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Este mês
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
            Financiamentos
          </CardTitle>
          <CreditCard className="h-4 w-4" style={{ color: '#1E3A8A' }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
            {financings}
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Ativos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}