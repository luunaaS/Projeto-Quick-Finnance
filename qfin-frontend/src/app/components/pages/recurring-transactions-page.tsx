import { Calendar, Repeat, Clock, DollarSign, Plus, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../ui/simple-card';
import { Button } from '../ui/simple-button';
import api from '../../../services/api';

interface RecurringTransaction {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  autoLaunch: boolean;
  isActive: boolean;
  lastProcessed?: string;
  nextProcessing: string;
}

const frequencyLabels = { daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' };
const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function RecurringTransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [formData, setFormData] = useState({
    name: '', type: 'expense' as 'income' | 'expense', amount: '', category: '',
    frequency: 'monthly' as RecurringTransaction['frequency'], dayOfMonth: '1',
    dayOfWeek: '1', startDate: '', endDate: '', autoLaunch: false
  });

  useEffect(() => { loadRecurring(); }, []);

  const loadRecurring = async () => {
    try {
      const data = await api.getRecurringTransactions();
      setTransactions(data.map((t: any) => ({
        id: t.id.toString(), name: t.name,
        type: t.type.toLowerCase() as 'income' | 'expense',
        amount: t.amount, category: t.category,
        frequency: t.frequency.toLowerCase() as RecurringTransaction['frequency'],
        dayOfMonth: t.dayOfMonth, dayOfWeek: t.dayOfWeek,
        startDate: t.startDate, endDate: t.endDate,
        autoLaunch: t.autoLaunch, isActive: t.isActive,
        lastProcessed: t.lastProcessed, nextProcessing: t.nextProcessing,
      })));
    } catch (error) { console.error('Error loading recurring transactions:', error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name, type: formData.type.toUpperCase(),
      amount: Number(formData.amount), category: formData.category,
      frequency: formData.frequency.toUpperCase(),
      dayOfMonth: formData.frequency === 'monthly' ? Number(formData.dayOfMonth) : null,
      dayOfWeek: formData.frequency === 'weekly' ? Number(formData.dayOfWeek) : null,
      startDate: formData.startDate, endDate: formData.endDate || null,
      autoLaunch: formData.autoLaunch, isActive: true,
      nextProcessing: formData.startDate,
    };
    try {
      if (editingId) {
        const updated = await api.updateRecurringTransaction(editingId, payload);
        setTransactions(prev => prev.map(t => t.id === editingId ? mapFromBackend(updated) : t));
        setEditingId(null);
      } else {
        const created = await api.createRecurringTransaction(payload);
        setTransactions(prev => [mapFromBackend(created), ...prev]);
      }
    } catch (error) { console.error('Error saving recurring transaction:', error); }
    resetForm();
  };

  const mapFromBackend = (t: any): RecurringTransaction => ({
    id: t.id.toString(), name: t.name,
    type: t.type.toLowerCase() as 'income' | 'expense',
    amount: t.amount, category: t.category,
    frequency: t.frequency.toLowerCase() as RecurringTransaction['frequency'],
    dayOfMonth: t.dayOfMonth, dayOfWeek: t.dayOfWeek,
    startDate: t.startDate, endDate: t.endDate,
    autoLaunch: t.autoLaunch, isActive: t.isActive,
    lastProcessed: t.lastProcessed, nextProcessing: t.nextProcessing,
  });

  const resetForm = () => {
    setFormData({ name: '', type: 'expense', amount: '', category: '', frequency: 'monthly', dayOfMonth: '1', dayOfWeek: '1', startDate: '', endDate: '', autoLaunch: false });
    setShowForm(false);
  };

  const handleEdit = (t: RecurringTransaction) => {
    setFormData({ name: t.name, type: t.type, amount: t.amount.toString(), category: t.category,
      frequency: t.frequency, dayOfMonth: (t.dayOfMonth || 1).toString(),
      dayOfWeek: (t.dayOfWeek || 1).toString(), startDate: t.startDate,
      endDate: t.endDate || '', autoLaunch: t.autoLaunch });
    setEditingId(t.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteRecurringTransaction(id); setTransactions(prev => prev.filter(t => t.id !== id)); }
    catch (error) { console.error('Error deleting:', error); }
  };

  const toggleActive = async (id: string) => {
    try {
      const updated = await api.toggleRecurringTransaction(id);
      setTransactions(prev => prev.map(t => t.id === id ? mapFromBackend(updated) : t));
    } catch (error) { console.error('Error toggling:', error); }
  };

  const activeTransactions = transactions.filter(t => t.isActive);
  const totalMonthlyIncome = activeTransactions.filter(t => t.type === 'income' && t.frequency === 'monthly').reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyExpense = activeTransactions.filter(t => t.type === 'expense' && t.frequency === 'monthly').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>Transações Recorrentes</h1>
          <p style={{ color: '#6B7280' }}>Gerencie suas receitas e despesas automáticas</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90 flex items-center gap-2">
          <Plus className="h-4 w-4" />{showForm ? 'Cancelar' : 'Nova Recorrência'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Total Ativas</p><p className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>{activeTransactions.length}</p></div><Repeat className="h-8 w-8" style={{ color: '#1E3A8A', opacity: 0.2 }} /></div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Receita Mensal</p><p className="text-2xl font-bold" style={{ color: '#059669' }}>R$ {totalMonthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div><DollarSign className="h-8 w-8" style={{ color: '#059669', opacity: 0.2 }} /></div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Despesa Mensal</p><p className="text-2xl font-bold" style={{ color: '#DC2626' }}>R$ {totalMonthlyExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div><DollarSign className="h-8 w-8" style={{ color: '#DC2626', opacity: 0.2 }} /></div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Impacto Mensal</p><p className="text-2xl font-bold" style={{ color: totalMonthlyIncome - totalMonthlyExpense >= 0 ? '#059669' : '#DC2626' }}>R$ {(totalMonthlyIncome - totalMonthlyExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div><Clock className="h-8 w-8" style={{ color: '#6B7280', opacity: 0.2 }} /></div></Card>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E3A8A' }}>{editingId ? 'Editar Recorrência' : 'Nova Recorrência'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="block text-sm font-medium mb-1">Nome</label><input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-1">Tipo</label><select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as any }))} className="w-full px-3 py-2 border rounded-lg"><option value="income">Receita</option><option value="expense">Despesa</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Valor (R$)</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-1">Categoria</label><input type="text" value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-1">Frequência</label><select value={formData.frequency} onChange={(e) => setFormData(p => ({ ...p, frequency: e.target.value as any }))} className="w-full px-3 py-2 border rounded-lg"><option value="daily">Diário</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="yearly">Anual</option></select></div>
              {formData.frequency === 'monthly' && <div><label className="block text-sm font-medium mb-1">Dia do Mês</label><input type="number" min="1" max="31" value={formData.dayOfMonth} onChange={(e) => setFormData(p => ({ ...p, dayOfMonth: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>}
              {formData.frequency === 'weekly' && <div><label className="block text-sm font-medium mb-1">Dia da Semana</label><select value={formData.dayOfWeek} onChange={(e) => setFormData(p => ({ ...p, dayOfWeek: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">{daysOfWeek.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>}
              <div><label className="block text-sm font-medium mb-1">Data de Início</label><input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-1">Data de Fim (opcional)</label><input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="flex items-center gap-2 pt-6"><input type="checkbox" checked={formData.autoLaunch} onChange={(e) => setFormData(p => ({ ...p, autoLaunch: e.target.checked }))} className="rounded" /><label className="text-sm">Lançamento automático</label></div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90">{editingId ? 'Salvar' : 'Criar Recorrência'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="p-6 border-b"><h3 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>Transações Recorrentes ({transactions.length})</h3></div>
        <div className="divide-y">
          {transactions.length === 0 ? (
            <div className="p-12 text-center"><Repeat className="h-12 w-12 mx-auto mb-4" style={{ color: '#6B7280', opacity: 0.3 }} /><p style={{ color: '#6B7280' }}>Nenhuma transação recorrente cadastrada</p></div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: transaction.type === 'income' ? '#05966920' : '#DC262620' }}>
                      <Repeat className="h-6 w-6" style={{ color: transaction.type === 'income' ? '#059669' : '#DC2626' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold" style={{ color: '#1E3A8A' }}>{transaction.name}</h4>
                        {!transaction.isActive && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#6B728020', color: '#6B7280' }}>Pausada</span>}
                        {transaction.autoLaunch && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1E3A8A20', color: '#1E3A8A' }}>Automático</span>}
                      </div>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        {transaction.category} • {frequencyLabels[transaction.frequency]}
                        {transaction.frequency === 'monthly' && transaction.dayOfMonth && ` • Dia ${transaction.dayOfMonth}`}
                        {transaction.frequency === 'weekly' && transaction.dayOfWeek !== undefined && ` • ${daysOfWeek[transaction.dayOfWeek]}`}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs" style={{ color: '#6B7280' }}>Próximo: {new Date(transaction.nextProcessing).toLocaleDateString('pt-BR')}</p>
                        {transaction.endDate && <p className="text-xs" style={{ color: '#6B7280' }}>Termina: {new Date(transaction.endDate).toLocaleDateString('pt-BR')}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: transaction.type === 'income' ? '#059669' : '#DC2626' }}>
                        {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => toggleActive(transaction.id)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title={transaction.isActive ? 'Pausar' : 'Ativar'}>
                      {transaction.isActive ? <Pause className="h-4 w-4" style={{ color: '#F59E0B' }} /> : <Play className="h-4 w-4" style={{ color: '#059669' }} />}
                    </button>
                    <button onClick={() => handleEdit(transaction)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Editar"><Edit2 className="h-4 w-4" style={{ color: '#1E3A8A' }} /></button>
                    <button onClick={() => handleDelete(transaction.id)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Excluir"><Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6" style={{ backgroundColor: '#EFF6FF' }}>
        <div className="flex gap-3">
          <Calendar className="h-5 w-5 flex-shrink-0" style={{ color: '#1E3A8A' }} />
          <div>
            <h4 className="font-semibold mb-1" style={{ color: '#1E3A8A' }}>Como funcionam as transações recorrentes?</h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              • <strong>Lançamento automático:</strong> A transação será registrada automaticamente na data programada.<br />
              • <strong>Lembrete para confirmação:</strong> Você receberá uma notificação para confirmar o lançamento.<br />
              • <strong>Pausar recorrência:</strong> Você pode pausar temporariamente uma recorrência sem excluí-la.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
