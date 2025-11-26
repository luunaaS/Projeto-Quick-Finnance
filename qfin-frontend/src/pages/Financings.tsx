import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { FinancingSection } from '../components/financing-section';
import { useAuth } from '../contexts/AuthContext';
import { financingService } from '../services/financing.service';
import type { Financing } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, TrendingDown, Calendar } from 'lucide-react';

export function Financings() {
  const { isAuthenticated } = useAuth();
  const [financings, setFinancings] = useState<Financing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadFinancings();
    }
  }, [isAuthenticated]);

  const loadFinancings = async () => {
    try {
      setLoading(true);
      const data = await financingService.getAllFinancings();
      setFinancings(data);
    } catch (error) {
      console.error('Error loading financings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFinancing = async (newFinancing: Omit<Financing, 'id'>) => {
    try {
      const created = await financingService.createFinancing(newFinancing);
      if (created) {
        setFinancings(prev => [created, ...prev]);
      }
    } catch (error) {
      console.error('Error adding financing:', error);
    }
  };

  const handleUpdateFinancing = async (id: number, updatedFinancing: Partial<Financing>) => {
    try {
      const updated = await financingService.updateFinancing(id, updatedFinancing);
      if (updated) {
        setFinancings(prev => prev.map(f => f.id === id ? updated : f));
      }
    } catch (error) {
      console.error('Error updating financing:', error);
    }
  };

  const handleDeleteFinancing = async (id: number) => {
    try {
      const success = await financingService.deleteFinancing(id);
      if (success) {
        setFinancings(prev => prev.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error('Error deleting financing:', error);
    }
  };

  const totalFinanced = financings.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalRemaining = financings.reduce((sum, f) => sum + f.remainingAmount, 0);
  const totalMonthly = financings.reduce((sum, f) => sum + f.monthlyPayment, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financiamentos</h1>
          <p className="text-gray-600 mt-2">Gerencie seus empréstimos e financiamentos</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Financiado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {totalFinanced.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {financings.length} financiamento(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Devedor</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {totalRemaining.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalRemaining / totalFinanced) * 100 || 0).toFixed(1)}% restante
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parcela Mensal Total</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalMonthly.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Compromisso mensal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Financiamentos */}
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">Carregando financiamentos...</p>
            </CardContent>
          </Card>
        ) : (
          <FinancingSection 
            financings={financings}
            onAddFinancing={handleAddFinancing}
            onUpdateFinancing={handleUpdateFinancing}
            onDeleteFinancing={handleDeleteFinancing}
            onRefresh={loadFinancings}
          />
        )}

        {/* Informações Adicionais */}
        {financings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Análise de Financiamentos</CardTitle>
              <CardDescription>Visão geral dos seus compromissos financeiros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Valor Total Pago</p>
                    <p className="text-xs text-blue-700">Até o momento</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {(totalFinanced - totalRemaining).toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Progresso Geral</p>
                    <p className="text-xs text-green-700">Percentual quitado</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {(((totalFinanced - totalRemaining) / totalFinanced) * 100 || 0).toFixed(1)}%
                  </p>
                </div>

                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-orange-900">Comprometimento Anual</p>
                    <p className="text-xs text-orange-700">Parcelas mensais × 12</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {(totalMonthly * 12).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
