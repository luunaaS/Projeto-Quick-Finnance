import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) return;

    onAddTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString().split('T')[0]
    });

    setAmount('');
    setCategory('');
    setDescription('');
  };

  const incomeCategories = [
    'Salário',
    'Freelance',
    'Investimentos',
    'Aluguel',
    'Outros'
  ];

  const expenseCategories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Compras',
    'Outros'
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#1E3A8A' }}>
          <Plus className="h-5 w-5" />
          Nova Transação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'INCOME' ? 'default' : 'outline'}
              onClick={() => setType('INCOME')}
              className="flex-1"
              style={type === 'INCOME' ? { backgroundColor: '#059669', borderColor: '#059669' } : { borderColor: '#059669', color: '#059669' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Receita
            </Button>
            <Button
              type="button"
              variant={type === 'EXPENSE' ? 'default' : 'outline'}
              onClick={() => setType('EXPENSE')}
              className="flex-1"
              style={type === 'EXPENSE' ? { backgroundColor: '#DC2626', borderColor: '#DC2626' } : { borderColor: '#DC2626', color: '#DC2626' }}
            >
              <Minus className="h-4 w-4 mr-2" />
              Despesa
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {(type === 'INCOME' ? incomeCategories : expenseCategories).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição da transação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
          >
            Adicionar Transação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}