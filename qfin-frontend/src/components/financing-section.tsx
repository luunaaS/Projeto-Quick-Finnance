import { useState } from "react";
import { CreditCard, Plus, Calendar, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

interface Financing {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  type: string;
  endDate: string;
}

interface FinancingSectionProps {
  financings: Financing[];
  onAddFinancing: (financing: Omit<Financing, 'id'>) => void;
}

export function FinancingSection({ financings, onAddFinancing }: FinancingSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [type, setType] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !totalAmount || !remainingAmount || !monthlyPayment || !type || !endDate) return;

    onAddFinancing({
      name,
      totalAmount: parseFloat(totalAmount),
      remainingAmount: parseFloat(remainingAmount),
      monthlyPayment: parseFloat(monthlyPayment),
      type,
      endDate
    });

    setName('');
    setTotalAmount('');
    setRemainingAmount('');
    setMonthlyPayment('');
    setType('');
    setEndDate('');
    setIsOpen(false);
  };

  const getProgressPercentage = (total: number, remaining: number) => {
    return ((total - remaining) / total) * 100;
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#1E3A8A' }}>
            <CreditCard className="h-5 w-5" />
            Financiamentos
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle style={{ color: '#1E3A8A' }}>
                  Novo Financiamento
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Financiamento</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Financiamento do carro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Valor Total</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remainingAmount">Valor Restante</Label>
                    <Input
                      id="remainingAmount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={remainingAmount}
                      onChange={(e) => setRemainingAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyPayment">Parcela Mensal</Label>
                    <Input
                      id="monthlyPayment"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={type} onValueChange={setType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Veículo">Veículo</SelectItem>
                      <SelectItem value="Imóvel">Imóvel</SelectItem>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
                >
                  Adicionar Financiamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {financings.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: '#6B7280' }}>
              Nenhum financiamento cadastrado. Clique em "Adicionar" para registrar um novo financiamento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {financings.map((financing) => (
              <div
                key={financing.id}
                className="p-4 rounded-lg border bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{financing.name}</h4>
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280'
                      }}
                    >
                      {financing.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      Parcela mensal
                    </p>
                    <p className="font-bold" style={{ color: '#DC2626' }}>
                      {formatCurrency(financing.monthlyPayment)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#6B7280' }}>Progresso</span>
                    <span style={{ color: '#6B7280' }}>
                      {getProgressPercentage(financing.totalAmount, financing.remainingAmount).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: '#059669',
                        width: `${getProgressPercentage(financing.totalAmount, financing.remainingAmount)}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#6B7280' }}>
                      Restante: {formatCurrency(financing.remainingAmount)}
                    </span>
                    <span style={{ color: '#6B7280' }}>
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(financing.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}