import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, Edit2, Trash2, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../ui/simple-card';
import { Button } from '../ui/simple-button';
import api from '../../../services/api';

interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'funds' | 'fixed-income' | 'crypto';
  amount: number;
  currentValue: number;
  purchaseDate: string;
  quantity: number;
  averagePrice: number;
}

const investmentTypes = {
  stocks: { label: 'Ações', icon: TrendingUp, color: '#1E3A8A' },
  funds: { label: 'Fundos', icon: PieChart, color: '#059669' },
  'fixed-income': { label: 'Renda Fixa', icon: BarChart3, color: '#6B7280' },
  crypto: { label: 'Criptomoedas', icon: DollarSign, color: '#F59E0B' }
};

const mapTypeFromBackend = (type: string): Investment['type'] => {
  const map: Record<string, Investment['type']> = {
    'STOCKS': 'stocks', 'FUNDS': 'funds', 'FIXED_INCOME': 'fixed-income', 'CRYPTO': 'crypto',
  };
  return map[type] || 'stocks';
};

const mapTypeToBackend = (type: string): string => {
  const map: Record<string, string> = {
    'stocks': 'STOCKS', 'funds': 'FUNDS', 'fixed-income': 'FIXED_INCOME', 'crypto': 'CRYPTO',
  };
  return map[type] || 'STOCKS';
};

export function InvestmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [formData, setFormData] = useState({
    name: '', type: 'stocks' as Investment['type'], amount: '', currentValue: '',
    purchaseDate: '', quantity: '', averagePrice: ''
  });

  useEffect(() => { loadInvestments(); }, []);

  const loadInvestments = async () => {
    try {
      const data = await api.getInvestments();
      setInvestments(data.map((inv: any) => ({
        id: inv.id.toString(), name: inv.name, type: mapTypeFromBackend(inv.type),
        amount: inv.amount, currentValue: inv.currentValue, purchaseDate: inv.purchaseDate,
        quantity: inv.quantity, averagePrice: inv.averagePrice,
      })));
    } catch (error) { console.error('Error loading investments:', error); }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const investmentData = {
      name: formData.name, type: mapTypeToBackend(formData.type),
      amount: Number(formData.amount), currentValue: Number(formData.currentValue),
      purchaseDate: formData.purchaseDate, quantity: Number(formData.quantity),
      averagePrice: Number(formData.averagePrice),
    };
    try {
      if (editingId) {
        const updated = await api.updateInvestment(editingId, investmentData);
        setInvestments(prev => prev.map(inv => inv.id === editingId ? {
          id: updated.id.toString(), name: updated.name, type: mapTypeFromBackend(updated.type),
          amount: updated.amount, currentValue: updated.currentValue, purchaseDate: updated.purchaseDate,
          quantity: updated.quantity, averagePrice: updated.averagePrice,
        } : inv));
        setEditingId(null);
      } else {
        const created = await api.createInvestment(investmentData);
        setInvestments(prev => [{ id: created.id.toString(), name: created.name,
          type: mapTypeFromBackend(created.type), amount: created.amount,
          currentValue: created.currentValue, purchaseDate: created.purchaseDate,
          quantity: created.quantity, averagePrice: created.averagePrice,
        }, ...prev]);
      }
    } catch (error) { console.error('Error saving investment:', error); }
    setFormData({ name: '', type: 'stocks', amount: '', currentValue: '', purchaseDate: '', quantity: '', averagePrice: '' });
    setShowForm(false);
  };

  const handleEdit = (investment: Investment) => {
    setFormData({ name: investment.name, type: investment.type, amount: investment.amount.toString(),
      currentValue: investment.currentValue.toString(), purchaseDate: investment.purchaseDate,
      quantity: investment.quantity.toString(), averagePrice: investment.averagePrice.toString() });
    setEditingId(investment.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteInvestment(id); setInvestments(prev => prev.filter(inv => inv.id !== id)); }
    catch (error) { console.error('Error deleting investment:', error); }
  };

  const calculateProfit = (inv: Investment) => inv.currentValue - inv.amount;
  const calculateProfitPercentage = (inv: Investment) => inv.amount > 0 ? ((inv.currentValue - inv.amount) / inv.amount) * 100 : 0;

  const getInvestmentsByType = () => {
    const byType: Record<string, number> = {};
    investments.forEach(inv => { byType[inv.type] = (byType[inv.type] || 0) + inv.currentValue; });
    return byType;
  };
  const investmentsByType = getInvestmentsByType();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>Investimentos</h1>
          <p style={{ color: '#6B7280' }}>Acompanhe seu portfólio e rentabilidade</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', type: 'stocks', amount: '', currentValue: '', purchaseDate: '', quantity: '', averagePrice: '' }); }}
          style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90 flex items-center gap-2">
          <Plus className="h-4 w-4" />{showForm ? 'Cancelar' : 'Novo Investimento'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Total Investido</p><p className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div><DollarSign className="h-8 w-8" style={{ color: '#1E3A8A', opacity: 0.2 }} /></div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Valor Atual</p><p className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>R$ {totalCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div><TrendingUp className="h-8 w-8" style={{ color: '#1E3A8A', opacity: 0.2 }} /></div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Lucro/Prejuízo</p><p className="text-2xl font-bold" style={{ color: totalProfit >= 0 ? '#059669' : '#DC2626' }}>R$ {Math.abs(totalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>{totalProfit >= 0 ? <TrendingUp className="h-8 w-8" style={{ color: '#059669', opacity: 0.2 }} /> : <TrendingDown className="h-8 w-8" style={{ color: '#DC2626', opacity: 0.2 }} />}</div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Rentabilidade</p><p className="text-2xl font-bold" style={{ color: profitPercentage >= 0 ? '#059669' : '#DC2626' }}>{profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%</p></div><PieChart className="h-8 w-8" style={{ color: profitPercentage >= 0 ? '#059669' : '#DC2626', opacity: 0.2 }} /></div></Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E3A8A' }}>Distribuição por Tipo</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(investmentTypes).map(([key, { label, icon: Icon, color }]) => {
            const value = investmentsByType[key] || 0;
            const percentage = totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0;
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2"><Icon className="h-4 w-4" style={{ color }} /><span className="text-sm font-medium">{label}</span></div>
                <p className="text-xl font-bold" style={{ color }}>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} /></div>
                <p className="text-xs" style={{ color: '#6B7280' }}>{percentage.toFixed(1)}% do total</p>
              </div>
            );
          })}
        </div>
      </Card>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E3A8A' }}>{editingId ? 'Editar Investimento' : 'Novo Investimento'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="block text-sm font-medium mb-2">Nome do Ativo</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: PETR4" required /></div>
              <div><label className="block text-sm font-medium mb-2">Tipo</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Investment['type'] })} className="w-full px-3 py-2 border rounded-lg" required><option value="stocks">Ações</option><option value="funds">Fundos</option><option value="fixed-income">Renda Fixa</option><option value="crypto">Criptomoedas</option></select></div>
              <div><label className="block text-sm font-medium mb-2">Valor Investido (R$)</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-2">Valor Atual (R$)</label><input type="number" step="0.01" value={formData.currentValue} onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-2">Data de Compra</label><input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-2">Quantidade</label><input type="number" step="0.000001" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-2">Preço Médio (R$)</label><input type="number" step="0.01" value={formData.averagePrice} onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90">{editingId ? 'Salvar Alterações' : 'Adicionar Investimento'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="p-6 border-b"><h3 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>Meus Investimentos</h3></div>
        <div className="divide-y">
          {investments.length === 0 ? (
            <div className="p-12 text-center"><PieChart className="h-12 w-12 mx-auto mb-4" style={{ color: '#6B7280', opacity: 0.3 }} /><p style={{ color: '#6B7280' }}>Nenhum investimento cadastrado</p></div>
          ) : (
            investments.map((investment) => {
              const profit = calculateProfit(investment);
              const profitPercent = calculateProfitPercentage(investment);
              const TypeIcon = investmentTypes[investment.type].icon;
              const typeColor = investmentTypes[investment.type].color;
              return (
                <div key={investment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${typeColor}20`, color: typeColor }}><TypeIcon className="h-6 w-6" /></div>
                      <div className="flex-1">
                        <h4 className="font-semibold" style={{ color: '#1E3A8A' }}>{investment.name}</h4>
                        <p className="text-sm" style={{ color: '#6B7280' }}>{investmentTypes[investment.type].label} • {investment.quantity} unidades</p>
                        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Comprado em {new Date(investment.purchaseDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right"><p className="text-sm" style={{ color: '#6B7280' }}>Investido</p><p className="font-semibold" style={{ color: '#1E3A8A' }}>R$ {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                      <div className="text-right"><p className="text-sm" style={{ color: '#6B7280' }}>Valor Atual</p><p className="font-semibold" style={{ color: '#1E3A8A' }}>R$ {investment.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                      <div className="text-right min-w-[120px]">
                        <p className="text-sm" style={{ color: '#6B7280' }}>Rentabilidade</p>
                        <div className="flex items-center gap-2 justify-end">
                          {profit >= 0 ? <TrendingUp className="h-4 w-4" style={{ color: '#059669' }} /> : <TrendingDown className="h-4 w-4" style={{ color: '#DC2626' }} />}
                          <div><p className="font-semibold" style={{ color: profit >= 0 ? '#059669' : '#DC2626' }}>{profit >= 0 ? '+' : ''}R$ {Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><p className="text-xs" style={{ color: profit >= 0 ? '#059669' : '#DC2626' }}>{profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%</p></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleEdit(investment)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Editar"><Edit2 className="h-4 w-4" style={{ color: '#1E3A8A' }} /></button>
                      <button onClick={() => handleDelete(investment.id)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Excluir"><Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
