import { useState } from 'react';
import { Plus, Calendar, DollarSign, TrendingDown, Building, Car } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Financing {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  type: string;
  endDate: string;
}

interface FinancingPageProps {
  financings: Financing[];
  onAddFinancing: (financing: Omit<Financing, 'id'>) => void;
}

export function FinancingPage({ financings, onAddFinancing }: FinancingPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    remainingAmount: '',
    monthlyPayment: '',
    type: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddFinancing({
      name: formData.name,
      totalAmount: parseFloat(formData.totalAmount),
      remainingAmount: parseFloat(formData.remainingAmount),
      monthlyPayment: parseFloat(formData.monthlyPayment),
      type: formData.type,
      endDate: formData.endDate
    });

    setFormData({
      name: '',
      totalAmount: '',
      remainingAmount: '',
      monthlyPayment: '',
      type: '',
      endDate: ''
    });
    setShowForm(false);
  };

  // Calcular estatísticas
  const totalFinanced = financings.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalRemaining = financings.reduce((sum, f) => sum + f.remainingAmount, 0);
  const totalMonthlyPayments = financings.reduce((sum, f) => sum + f.monthlyPayment, 0);
  const totalPaid = totalFinanced - totalRemaining;

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'imóvel':
      case 'casa':
        return <Building className="h-4 w-4" />;
      case 'veículo':
      case 'carro':
        return <Car className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'imóvel':
      case 'casa':
        return '#059669';
      case 'veículo':
      case 'carro':
        return '#1E3A8A';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            Financiamentos
          </h1>
          <p style={{ color: '#6B7280' }}>
            Acompanhe seus financiamentos e empréstimos
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button 
              style={{ backgroundColor: '#1E3A8A' }}
              className="hover:bg-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Financiamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ color: '#1E3A8A' }}>Novo Financiamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Financiamento</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Financiamento do carro"
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
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remainingAmount">Valor Restante</Label>
                  <Input
                    id="remainingAmount"
                    type="number"
                    step="0.01"
                    value={formData.remainingAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, remainingAmount: e.target.value }))}
                    placeholder="0,00"
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
                    value={formData.monthlyPayment}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyPayment: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Imóvel">Imóvel</SelectItem>
                      <SelectItem value="Veículo">Veículo</SelectItem>
                      <SelectItem value="Empréstimo">Empréstimo</SelectItem>
                      <SelectItem value="Cartão">Cartão de Crédito</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" style={{ backgroundColor: '#1E3A8A' }} className="hover:bg-blue-800">
                  Adicionar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Total Financiado
            </CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: '#6B7280' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
              R$ {totalFinanced.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Total Pago
            </CardTitle>
            <TrendingDown className="h-4 w-4" style={{ color: '#059669' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#059669' }}>
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Valor Restante
            </CardTitle>
            <Calendar className="h-4 w-4" style={{ color: '#DC2626' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>
              R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Parcelas Mensais
            </CardTitle>
            <Calendar className="h-4 w-4" style={{ color: '#6B7280' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
              R$ {totalMonthlyPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de financiamentos */}
      <div className="grid gap-4 md:grid-cols-2">
        {financings.map((financing) => {
          const progressPercentage = ((financing.totalAmount - financing.remainingAmount) / financing.totalAmount) * 100;
          const monthsRemaining = Math.ceil(financing.remainingAmount / financing.monthlyPayment);

          return (
            <Card key={financing.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span style={{ color: getTypeColor(financing.type) }}>
                      {getTypeIcon(financing.type)}
                    </span>
                    <span style={{ color: '#1E3A8A' }}>{financing.name}</span>
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    style={{ 
                      backgroundColor: getTypeColor(financing.type) + '20',
                      color: getTypeColor(financing.type)
                    }}
                  >
                    {financing.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: '#6B7280' }}>Progresso</span>
                    <span style={{ color: '#6B7280' }}>
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p style={{ color: '#6B7280' }}>Valor Total</p>
                    <p className="font-medium">
                      R$ {financing.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6B7280' }}>Valor Restante</p>
                    <p className="font-medium" style={{ color: '#DC2626' }}>
                      R$ {financing.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6B7280' }}>Parcela Mensal</p>
                    <p className="font-medium">
                      R$ {financing.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#6B7280' }}>Meses Restantes</p>
                    <p className="font-medium">
                      {monthsRemaining} meses
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#6B7280' }}>Término em:</span>
                    <span className="font-medium">
                      {new Date(financing.endDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {financings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 mb-4" style={{ color: '#6B7280' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: '#6B7280' }}>
              Nenhum financiamento encontrado
            </h3>
            <p style={{ color: '#6B7280' }} className="text-center mb-4">
              Adicione seu primeiro financiamento para começar a acompanhar seus pagamentos.
            </p>
            <Button 
              onClick={() => setShowForm(true)}
              style={{ backgroundColor: '#1E3A8A' }}
              className="hover:bg-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Financiamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}