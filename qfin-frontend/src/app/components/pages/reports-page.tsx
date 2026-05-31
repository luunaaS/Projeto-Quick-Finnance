import { useState, useMemo, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, PieChart, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import api from '../../../services/api';
// Charts will be rendered using simple HTML/CSS instead of external libraries

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

interface ReportsPageProps {
  transactions: Transaction[];
  financings: Financing[];
}

export function ReportsPage({ transactions, financings }: ReportsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [selectedChart, setSelectedChart] = useState('monthly');
  const [chartsReady, setChartsReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure charts load properly
    const timer = setTimeout(() => {
      setChartsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Filtrar transações por período
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const periodStart = new Date();
    
    switch (selectedPeriod) {
      case '1m':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        periodStart.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        periodStart.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
      default:
        periodStart.setMonth(now.getMonth() - 6);
    }

    return transactions.filter(t => new Date(t.date) >= periodStart);
  }, [transactions, selectedPeriod]);

  // Dados para gráfico mensal
  const monthlyData = useMemo(() => {
    const monthsMap = new Map();
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          month: monthName,
          receitas: 0,
          despesas: 0,
          saldo: 0
        });
      }
      
      const monthData = monthsMap.get(monthKey);
      if (transaction.type === 'income') {
        monthData.receitas += transaction.amount;
      } else {
        monthData.despesas += transaction.amount;
      }
      monthData.saldo = monthData.receitas - monthData.despesas;
    });

    return Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  // Dados para gráfico de categorias (receitas)
  const categoryIncomeData = useMemo(() => {
    const categoryMap = new Map();
    
    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(transaction => {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
      });

    return Array.from(categoryMap.entries()).map(([category, value]) => ({
      name: category,
      value,
      fill: '#059669'
    }));
  }, [filteredTransactions]);

  // Dados para gráfico de categorias (despesas)
  const categoryExpenseData = useMemo(() => {
    const categoryMap = new Map();
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
      });

    const colors = ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'];
    
    return Array.from(categoryMap.entries()).map(([category, value], index) => ({
      name: category,
      value,
      fill: colors[index % colors.length]
    }));
  }, [filteredTransactions]);

  // Dados de evolução patrimonial
  const evolutionData = useMemo(() => {
    const dailyBalances = new Map();
    let cumulativeBalance = 0;

    // Ordenar transações por data
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedTransactions.forEach(transaction => {
      const dateStr = transaction.date;
      
      if (transaction.type === 'income') {
        cumulativeBalance += transaction.amount;
      } else {
        cumulativeBalance -= transaction.amount;
      }
      
      dailyBalances.set(dateStr, cumulativeBalance);
    });

    return Array.from(dailyBalances.entries()).map(([date, balance]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      patrimonio: balance
    }));
  }, [filteredTransactions]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const averageIncome = totalIncome / (monthlyData.length || 1);
    const averageExpenses = totalExpenses / (monthlyData.length || 1);

    const totalFinancingPayments = financings.reduce((sum, f) => sum + f.monthlyPayment, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      averageIncome,
      averageExpenses,
      totalFinancingPayments,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    };
  }, [filteredTransactions, monthlyData, financings]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      const now = new Date();
      const endDate = now.toISOString().slice(0, 10);
      const startDateObj = new Date(now);
      if (selectedPeriod === '1m') startDateObj.setMonth(now.getMonth() - 1);
      else if (selectedPeriod === '3m') startDateObj.setMonth(now.getMonth() - 3);
      else if (selectedPeriod === '6m') startDateObj.setMonth(now.getMonth() - 6);
      else startDateObj.setFullYear(now.getFullYear() - 1);
      const startDate = startDateObj.toISOString().slice(0, 10);

      const blob = format === 'csv'
        ? await api.exportTransactionsCSV(startDate, endDate)
        : await api.exportReportPDF(startDate, endDate);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'csv' ? `relatorio-${startDate}-${endDate}.csv` : `relatorio-${startDate}-${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Verifique os dados e tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderChart = () => {
    if (!chartsReady) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <p style={{ color: '#6B7280' }}>
            Carregando gráficos...
          </p>
        </div>
      );
    }

    switch (selectedChart) {
      case 'monthly':
        return (
          <div className="space-y-6">
            {monthlyData.map((month) => {
              const maxValue = Math.max(month.receitas, month.despesas, 1);
              return (
                <div key={month.month} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>
                      {month.month}
                    </h4>
                    <div className="text-sm" style={{ color: '#6B7280' }}>
                      Saldo: <span 
                        className="font-bold"
                        style={{ color: month.saldo >= 0 ? '#059669' : '#DC2626' }}
                      >
                        R$ {month.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#059669' }}>Receitas</span>
                      <span className="font-medium">
                        R$ {month.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="h-4 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(month.receitas / maxValue) * 100}%`,
                          backgroundColor: '#059669'
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#DC2626' }}>Despesas</span>
                      <span className="font-medium">
                        R$ {month.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="h-4 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(month.despesas / maxValue) * 100}%`,
                          backgroundColor: '#DC2626'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'evolution':
        if (evolutionData.length === 0) {
          return (
            <div className="flex items-center justify-center h-[400px]">
              <p style={{ color: '#6B7280' }}>
                Dados insuficientes para mostrar evolução patrimonial
              </p>
            </div>
          );
        }
        
        const maxPatrimonio = Math.max(...evolutionData.map(d => d.patrimonio));
        const minPatrimonio = Math.min(...evolutionData.map(d => d.patrimonio));
        const range = maxPatrimonio - minPatrimonio || 1;
        
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
                R$ {evolutionData[evolutionData.length - 1]?.patrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p style={{ color: '#6B7280' }}>Patrimônio Atual</p>
            </div>
            
            <div className="space-y-3">
              {evolutionData.map((data, index) => {
                const heightPercentage = ((data.patrimonio - minPatrimonio) / range) * 100;
                return (
                  <div key={index} className="flex items-end gap-2">
                    <div className="w-16 text-xs" style={{ color: '#6B7280' }}>
                      {data.date}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className="h-6 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${heightPercentage}%`,
                          backgroundColor: data.patrimonio >= 0 ? '#1E3A8A' : '#DC2626'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          R$ {data.patrimonio.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'categories':
        const totalIncomeValue = categoryIncomeData.reduce((sum, item) => sum + item.value, 0);
        const totalExpenseValue = categoryExpenseData.reduce((sum, item) => sum + item.value, 0);
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receitas por Categoria */}
            <div>
              <h4 className="text-lg font-medium mb-4" style={{ color: '#059669' }}>
                Receitas por Categoria
              </h4>
              {categoryIncomeData.length > 0 ? (
                <div className="space-y-3">
                  {categoryIncomeData.map((item, index) => {
                    const percentage = totalIncomeValue > 0 ? (item.value / totalIncomeValue) * 100 : 0;
                    return (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: '#059669' }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: '#059669' }}>
                            R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: '#059669'
                            }}
                          />
                        </div>
                        <div className="text-xs text-right" style={{ color: '#6B7280' }}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p style={{ color: '#6B7280' }}>
                    Nenhuma receita por categoria
                  </p>
                </div>
              )}
            </div>
            
            {/* Despesas por Categoria */}
            <div>
              <h4 className="text-lg font-medium mb-4" style={{ color: '#DC2626' }}>
                Despesas por Categoria
              </h4>
              {categoryExpenseData.length > 0 ? (
                <div className="space-y-3">
                  {categoryExpenseData.map((item, index) => {
                    const percentage = totalExpenseValue > 0 ? (item.value / totalExpenseValue) * 100 : 0;
                    return (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: '#DC2626' }}>
                            R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: item.fill
                            }}
                          />
                        </div>
                        <div className="text-xs text-right" style={{ color: '#6B7280' }}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <p style={{ color: '#6B7280' }}>
                    Nenhuma despesa por categoria
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            Relatórios
          </h1>
          <p style={{ color: '#6B7280' }}>
            Análise detalhada das suas finanças
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Mês</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="1y">1 Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            style={{ borderColor: '#1E3A8A', color: '#1E3A8A' }}
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button 
            variant="outline"
            style={{ borderColor: '#1E3A8A', color: '#1E3A8A' }}
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Receita Média Mensal
            </CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: '#059669' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#059669' }}>
              R$ {stats.averageIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Despesa Média Mensal
            </CardTitle>
            <TrendingDown className="h-4 w-4" style={{ color: '#DC2626' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>
              R$ {stats.averageExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Taxa de Poupança
            </CardTitle>
            <PieChart className="h-4 w-4" style={{ color: '#1E3A8A' }} />
          </CardHeader>
          <CardContent>
            <div 
              className="text-2xl font-bold"
              style={{ color: stats.savingsRate >= 0 ? '#059669' : '#DC2626' }}
            >
              {stats.savingsRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Financiamentos/Mês
            </CardTitle>
            <Calendar className="h-4 w-4" style={{ color: '#DC2626' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>
              R$ {stats.totalFinancingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de gráfico */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle style={{ color: '#1E3A8A' }}>Análise Gráfica</CardTitle>
            <Select value={selectedChart} onValueChange={setSelectedChart}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Receitas vs Despesas</SelectItem>
                <SelectItem value="evolution">Evolução Patrimonial</SelectItem>
                <SelectItem value="categories">Por Categorias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Resumo do período */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#1E3A8A' }}>Resumo do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#059669' + '10' }}>
              <div className="text-2xl font-bold" style={{ color: '#059669' }}>
                R$ {stats.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p style={{ color: '#6B7280' }}>Total de Receitas</p>
            </div>
            
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#DC2626' + '10' }}>
              <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>
                R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p style={{ color: '#6B7280' }}>Total de Despesas</p>
            </div>
            
            <div 
              className="text-center p-4 rounded-lg" 
              style={{ backgroundColor: (stats.balance >= 0 ? '#059669' : '#DC2626') + '10' }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: stats.balance >= 0 ? '#059669' : '#DC2626' }}
              >
                R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p style={{ color: '#6B7280' }}>Saldo Líquido</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}