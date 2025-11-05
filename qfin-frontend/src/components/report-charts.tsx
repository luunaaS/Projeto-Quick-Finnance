import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { ReportSummary } from '../services/reports.service';

interface ReportChartsProps {
  summary: ReportSummary | null;
}

const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2'];

export function ReportCharts({ summary }: ReportChartsProps) {
  if (!summary || !summary.categoryBreakdown || summary.categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Nenhum dado disponível para exibir gráficos</p>
        </CardContent>
      </Card>
    );
  }

  const incomeData = summary.categoryBreakdown
    .filter(item => item.type === 'INCOME')
    .map(item => ({
      name: item.category,
      value: item.totalAmount,
    }));

  const expenseData = summary.categoryBreakdown
    .filter(item => item.type === 'EXPENSE')
    .map(item => ({
      name: item.category,
      value: item.totalAmount,
    }));

  const comparisonData = [
    {
      name: 'Receitas',
      value: summary.totalIncome,
    },
    {
      name: 'Despesas',
      value: summary.totalExpense,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Receitas por Categoria */}
      {incomeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Despesas por Categoria */}
      {expenseData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Comparação Receitas vs Despesas */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Comparação: Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="value" fill="#1E3A8A" name="Valor (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
