import { Card, CardContent, CardHeader, CardTitle } from "./ui/simple-card";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface FinancialChartProps {
  transactions: Transaction[];
}

export function FinancialChart({ transactions }: FinancialChartProps) {
  // Calcular totais por categoria (despesas)
  const expensesByCategory = (transactions || [])
    .filter(t => t && t.type === 'expense')
    .reduce((acc, transaction) => {
      if (transaction && transaction.category && typeof transaction.amount === 'number') {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  // Calcular receitas e despesas por mês
  const monthlyData = (transactions || []).reduce((acc, transaction) => {
    if (!transaction || !transaction.date || !transaction.type || typeof transaction.amount !== 'number') {
      return acc;
    }
    
    try {
      const date = new Date(transaction.date);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expense += transaction.amount;
      }
    } catch (error) {
      console.warn('Error processing transaction date:', transaction.date, error);
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  const monthlyArray = Object.values(monthlyData);
  const maxAmount = Math.max(
    ...monthlyArray.map(m => Math.max(m.income, m.expense)),
    1
  );

  const categoryColors = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Despesas por Categoria */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: '#1E3A8A' }}>
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(expensesByCategory).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(expensesByCategory).map(([category, amount], index) => {
                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                        />
                        <span className="text-sm font-medium" style={{ color: '#6B7280' }}>
                          {category}
                        </span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#1E3A8A' }}>
                        R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: categoryColors[index % categoryColors.length]
                        }}
                      />
                    </div>
                    <div className="text-xs text-right" style={{ color: '#6B7280' }}>
                      {percentage.toFixed(1)}% do total
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: '#6B7280' }}>
                    Total de Despesas:
                  </span>
                  <span className="text-lg font-bold" style={{ color: '#DC2626' }}>
                    R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px]">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-center" style={{ color: '#6B7280' }}>
                Nenhuma despesa registrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Receitas vs Despesas */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: '#1E3A8A' }}>
            Receitas vs Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyArray.length > 0 ? (
            <div className="space-y-6">
              {monthlyArray.map((month) => (
                <div key={month.month} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>
                      {month.month}
                    </h4>
                    <div className="text-sm" style={{ color: '#6B7280' }}>
                      Saldo: <span 
                        className="font-bold"
                        style={{ color: month.income - month.expense >= 0 ? '#059669' : '#DC2626' }}
                      >
                        R$ {(month.income - month.expense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Receitas */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#059669' }}>💰 Receitas</span>
                      <span className="font-medium" style={{ color: '#059669' }}>
                        R$ {month.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(month.income / maxAmount) * 100}%`,
                          backgroundColor: '#059669'
                        }}
                      />
                    </div>
                  </div>

                  {/* Despesas */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#DC2626' }}>💸 Despesas</span>
                      <span className="font-medium" style={{ color: '#DC2626' }}>
                        R$ {month.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(month.expense / maxAmount) * 100}%`,
                          backgroundColor: '#DC2626'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Legenda */}
              <div className="flex justify-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#059669' }} />
                  <span className="text-sm" style={{ color: '#6B7280' }}>Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DC2626' }} />
                  <span className="text-sm" style={{ color: '#6B7280' }}>Despesas</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px]">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-center" style={{ color: '#6B7280' }}>
                Nenhuma transação registrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}