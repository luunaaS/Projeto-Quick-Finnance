import { Globe, DollarSign, TrendingUp, Plus, Trash2, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../ui/simple-card';
import { Button } from '../ui/simple-button';
import api from '../../../services/api';

interface MultiCurrencyTransaction {
  id: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  baseCurrency: string;
  exchangeRate: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated: string;
}

const currencies = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'Fr' },
];

export function MultiCurrencyPage() {
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<MultiCurrencyTransaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [formData, setFormData] = useState({
    description: '', amount: '', currency: 'USD', type: 'expense' as 'income' | 'expense',
    category: '', date: ''
  });
  const [convertFrom, setConvertFrom] = useState('USD');
  const [convertTo, setConvertTo] = useState('BRL');
  const [convertAmount, setConvertAmount] = useState('');
  const [convertResult, setConvertResult] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [txData, ratesData] = await Promise.all([
        api.getMultiCurrencyTransactions(),
        api.getExchangeRates()
      ]);
      setTransactions(txData.map((t: any) => ({
        id: t.id.toString(), description: t.description, amount: t.amount,
        currency: t.currency, convertedAmount: t.convertedAmount,
        baseCurrency: t.baseCurrency, exchangeRate: t.exchangeRate,
        type: t.type.toLowerCase() as 'income' | 'expense',
        category: t.category, date: t.date,
      })));
      setExchangeRates(ratesData.map((r: any) => ({
        currency: r.currency, rate: r.rate, lastUpdated: r.lastUpdated,
      })));
    } catch (error) { console.error('Error loading multi-currency data:', error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amountNumber = Number(formData.amount);
      let rate = 1;
      let convertedAmount = amountNumber;

      if (formData.currency !== 'BRL') {
        const conversion = await api.convertCurrency(formData.currency, 'BRL', amountNumber);
        rate = conversion.rate;
        convertedAmount = conversion.convertedAmount;
      }

      const payload = {
        description: formData.description,
        amount: amountNumber,
        currency: formData.currency,
        convertedAmount,
        baseCurrency: 'BRL',
        exchangeRate: rate,
        type: formData.type.toUpperCase(),
        category: formData.category,
        date: formData.date,
      };

      const created = await api.createMultiCurrencyTransaction(payload);
      setTransactions(prev => [{
        id: created.id.toString(), description: created.description, amount: created.amount,
        currency: created.currency, convertedAmount: created.convertedAmount,
        baseCurrency: created.baseCurrency, exchangeRate: created.exchangeRate,
        type: created.type.toLowerCase() as 'income' | 'expense',
        category: created.category, date: created.date,
      }, ...prev]);
      setFormData({ description: '', amount: '', currency: 'USD', type: 'expense', category: '', date: '' });
      setShowForm(false);
      await loadData();
    } catch (error) { console.error('Error creating transaction:', error); }
  };

  const handleDelete = async (id: string) => {
    try { await api.deleteMultiCurrencyTransaction(id); setTransactions(prev => prev.filter(t => t.id !== id)); }
    catch (error) { console.error('Error deleting:', error); }
  };

  const handleConvert = async () => {
    try {
      const result = await api.convertCurrency(convertFrom, convertTo, Number(convertAmount));
      setConvertResult(result.convertedAmount);
    } catch (error) { console.error('Error converting:', error); }
  };

  const getCurrencySymbol = (code: string) => currencies.find(c => c.code === code)?.symbol || code;

  const totalBRL = transactions.reduce((sum, t) => {
    const mult = t.type === 'income' ? 1 : -1;
    return sum + (t.convertedAmount * mult);
  }, 0);

  const totalIncomeBRL = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.convertedAmount, 0);
  const totalExpenseBRL = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.convertedAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>Multi-Moeda</h1>
          <p style={{ color: '#6B7280' }}>Gerencie transações em múltiplas moedas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90 flex items-center gap-2">
          <Plus className="h-4 w-4" />{showForm ? 'Cancelar' : 'Nova Transação'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Saldo Consolidado (BRL)</p><p className="text-2xl font-bold" style={{ color: totalBRL >= 0 ? '#059669' : '#DC2626' }}>R$ {Math.abs(totalBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div><Globe className="h-8 w-8" style={{ color: '#1E3A8A', opacity: 0.2 }} /></div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Receitas (BRL)</p><p className="text-2xl font-bold" style={{ color: '#059669' }}>R$ {totalIncomeBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div><TrendingUp className="h-8 w-8" style={{ color: '#059669', opacity: 0.2 }} /></div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm" style={{ color: '#6B7280' }}>Despesas (BRL)</p><p className="text-2xl font-bold" style={{ color: '#DC2626' }}>R$ {totalExpenseBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div><DollarSign className="h-8 w-8" style={{ color: '#DC2626', opacity: 0.2 }} /></div></Card>
      </div>

      {/* Currency Converter */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E3A8A' }}>
          <ArrowRightLeft className="h-5 w-5 inline mr-2" />Conversor de Moedas
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <div><label className="block text-sm font-medium mb-1">Valor</label><input type="number" step="0.01" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} className="px-3 py-2 border rounded-lg w-32" style={{ borderColor: '#D1D5DB' }} /></div>
          <div><label className="block text-sm font-medium mb-1">De</label><select value={convertFrom} onChange={(e) => setConvertFrom(e.target.value)} className="px-3 py-2 border rounded-lg" style={{ borderColor: '#D1D5DB' }}>{currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Para</label><select value={convertTo} onChange={(e) => setConvertTo(e.target.value)} className="px-3 py-2 border rounded-lg" style={{ borderColor: '#D1D5DB' }}>{currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}</select></div>
          <Button onClick={handleConvert} style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90"><RefreshCw className="h-4 w-4 mr-2" />Converter</Button>
          {convertResult !== null && <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#EFF6FF' }}><p className="font-semibold" style={{ color: '#1E3A8A' }}>{getCurrencySymbol(convertTo)} {convertResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>}
        </div>
      </Card>

      {/* Exchange Rates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E3A8A' }}>Taxas de Câmbio (Base: BRL)</h3>
        <div className="grid gap-3 md:grid-cols-4">
          {exchangeRates.filter(r => r.currency !== 'BRL').map(rate => (
            <div key={rate.currency} className="p-3 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{rate.currency}</span>
                <span className="text-sm font-bold" style={{ color: '#1E3A8A' }}>R$ {rate.rate.toFixed(4)}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{currencies.find(c => c.code === rate.currency)?.name}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E3A8A' }}>Nova Transação Multi-Moeda</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="block text-sm font-medium mb-1">Descrição</label><input type="text" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-1">Tipo</label><select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as any }))} className="w-full px-3 py-2 border rounded-lg"><option value="income">Receita</option><option value="expense">Despesa</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Valor</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-1">Moeda</label><select value={formData.currency} onChange={(e) => setFormData(p => ({ ...p, currency: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">{currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Categoria</label><input type="text" value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div><label className="block text-sm font-medium mb-1">Data</label><input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: '#1E3A8A', color: 'white' }} className="hover:opacity-90">Adicionar Transação</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <div className="p-6 border-b"><h3 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>Transações Multi-Moeda ({transactions.length})</h3></div>
        <div className="divide-y">
          {transactions.length === 0 ? (
            <div className="p-12 text-center"><Globe className="h-12 w-12 mx-auto mb-4" style={{ color: '#6B7280', opacity: 0.3 }} /><p style={{ color: '#6B7280' }}>Nenhuma transação multi-moeda cadastrada</p></div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: transaction.type === 'income' ? '#05966920' : '#DC262620' }}>
                      <DollarSign className="h-6 w-6" style={{ color: transaction.type === 'income' ? '#059669' : '#DC2626' }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold" style={{ color: '#1E3A8A' }}>{transaction.description}</h4>
                      <p className="text-sm" style={{ color: '#6B7280' }}>{transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: transaction.type === 'income' ? '#059669' : '#DC2626' }}>
                        {getCurrencySymbol(transaction.currency)} {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>≈ R$ {transaction.convertedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>Taxa: {transaction.exchangeRate.toFixed(4)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(transaction.id)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors ml-4" title="Excluir">
                    <Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
