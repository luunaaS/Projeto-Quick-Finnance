import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { Transaction } from '../types';

interface FinancialChartProps {
  transactions: Transaction[];
}

export function FinancialChart({ transactions }: FinancialChartProps) {
  // Preparar dados para o gráfico de pizza (despesas por categoria)
  const expensesByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Preparar dados para o gráfico de barras (receitas vs despesas por mês)
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('pt-BR', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, income: 0, expense: 0 };
    }
    
    if (transaction.type === 'INCOME') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expense += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  const barData = Object.values(monthlyData);

  const COLORS = ['#1E3A8A', '#059669', '#DC2626', '#6B7280', '#F59E0B', '#8B5CF6'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: '#1E3A8A' }}>
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p style={{ color: '#6B7280' }}>
                Nenhuma despesa registrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: '#1E3A8A' }}>
            Receitas vs Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="income" fill="#059669" name="Receitas" />
                <Bar dataKey="expense" fill="#DC2626" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p style={{ color: '#6B7280' }}>
                Nenhuma transação registrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}