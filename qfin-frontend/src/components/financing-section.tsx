import { useState, useEffect } from "react";
import { CreditCard, Plus, Calendar, DollarSign, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import type { Financing, Payment } from '../types';
import { financingService } from '../services/financing.service';

interface FinancingSectionProps {
  financings: Financing[];
  onAddFinancing: (financing: Omit<Financing, 'id'>) => void;
  onUpdateFinancing: (id: number, financing: Partial<Financing>) => void;
  onDeleteFinancing: (id: number) => void;
}

export function FinancingSection({ financings, onAddFinancing, onUpdateFinancing, onDeleteFinancing }: FinancingSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaymentsListOpen, setIsPaymentsListOpen] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<Financing | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Form states para novo financiamento
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [type, setType] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form states para editar financiamento
  const [editName, setEditName] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editRemainingAmount, setEditRemainingAmount] = useState('');
  const [editMonthlyPayment, setEditMonthlyPayment] = useState('');
  const [editType, setEditType] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  // Form states para pagamento
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');

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

  const handleEdit = (financing: Financing) => {
    setSelectedFinancing(financing);
    setEditName(financing.name);
    setEditTotalAmount(financing.totalAmount.toString());
    setEditRemainingAmount(financing.remainingAmount.toString());
    setEditMonthlyPayment(financing.monthlyPayment.toString());
    setEditType(financing.type);
    setEditEndDate(financing.endDate);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFinancing || !editName || !editTotalAmount || !editRemainingAmount || !editMonthlyPayment || !editType || !editEndDate) return;

    onUpdateFinancing(selectedFinancing.id!, {
      name: editName,
      totalAmount: parseFloat(editTotalAmount),
      remainingAmount: parseFloat(editRemainingAmount),
      monthlyPayment: parseFloat(editMonthlyPayment),
      type: editType,
      endDate: editEndDate
    });

    setIsEditOpen(false);
    setSelectedFinancing(null);
  };

  const handleAddPayment = (financing: Financing) => {
    setSelectedFinancing(financing);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setIsPaymentOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFinancing || !paymentAmount || !paymentDate) return;

    const payment = {
      amount: parseFloat(paymentAmount),
      paymentDate,
      description: paymentDescription
    };

    const result = await financingService.addPayment(selectedFinancing.id!, payment);
    
    if (result) {
      alert('Pagamento adicionado com sucesso!');
      setPaymentAmount('');
      setPaymentDate('');
      setPaymentDescription('');
      setIsPaymentOpen(false);
      
      // Recarregar a página ou atualizar o estado
      window.location.reload();
    } else {
      alert('Erro ao adicionar pagamento');
    }
  };

  const handleViewPayments = async (financing: Financing) => {
    setSelectedFinancing(financing);
    const paymentsData = await financingService.getPaymentsByFinancing(financing.id!);
    setPayments(paymentsData);
    setIsPaymentsListOpen(true);
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!selectedFinancing) return;
    
    if (confirm('Deseja realmente excluir este pagamento?')) {
      const success = await financingService.deletePayment(selectedFinancing.id!, paymentId);
      
      if (success) {
        alert('Pagamento excluído com sucesso!');
        const paymentsData = await financingService.getPaymentsByFinancing(selectedFinancing.id!);
        setPayments(paymentsData);
        window.location.reload();
      } else {
        alert('Erro ao excluir pagamento');
      }
    }
  };

  const getProgressPercentage = (total: number, remaining: number) => {
    return ((total - remaining) / total) * 100;
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'CAR_FINANCING': 'Veículo',
      'MORTGAGE': 'Imóvel',
      'PERSONAL_LOAN': 'Pessoal',
      'STUDENT_LOAN': 'Estudantil',
      'LOAN': 'Empréstimo',
      'OTHER': 'Outros'
    };
    return typeLabels[type] || type;
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
                      <SelectItem value="CAR_FINANCING">Veículo</SelectItem>
                      <SelectItem value="MORTGAGE">Imóvel</SelectItem>
                      <SelectItem value="PERSONAL_LOAN">Pessoal</SelectItem>
                      <SelectItem value="STUDENT_LOAN">Estudantil</SelectItem>
                      <SelectItem value="LOAN">Empréstimo</SelectItem>
                      <SelectItem value="OTHER">Outros</SelectItem>
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
                      {getTypeLabel(financing.type)}
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

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddPayment(financing)}
                    className="flex-1"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Adicionar Pagamento
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewPayments(financing)}
                  >
                    Ver Pagamentos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(financing)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Deseja realmente excluir este financiamento?')) {
                        onDeleteFinancing(financing.id!);
                      }
                    }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog para editar financiamento */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#1E3A8A' }}>
              Editar Financiamento
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nome do Financiamento</Label>
              <Input
                id="editName"
                placeholder="Ex: Financiamento do carro"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTotalAmount">Valor Total</Label>
                <Input
                  id="editTotalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={editTotalAmount}
                  onChange={(e) => setEditTotalAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRemainingAmount">Valor Restante</Label>
                <Input
                  id="editRemainingAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={editRemainingAmount}
                  onChange={(e) => setEditRemainingAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editMonthlyPayment">Parcela Mensal</Label>
                <Input
                  id="editMonthlyPayment"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={editMonthlyPayment}
                  onChange={(e) => setEditMonthlyPayment(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEndDate">Data de Término</Label>
                <Input
                  id="editEndDate"
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editType">Tipo</Label>
              <Select value={editType} onValueChange={setEditType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAR_FINANCING">Veículo</SelectItem>
                  <SelectItem value="MORTGAGE">Imóvel</SelectItem>
                  <SelectItem value="PERSONAL_LOAN">Pessoal</SelectItem>
                  <SelectItem value="STUDENT_LOAN">Estudantil</SelectItem>
                  <SelectItem value="LOAN">Empréstimo</SelectItem>
                  <SelectItem value="OTHER">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
              >
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar pagamento */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#1E3A8A' }}>
              Adicionar Pagamento
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Valor do Pagamento</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Data do Pagamento</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDescription">Descrição (opcional)</Label>
              <Input
                id="paymentDescription"
                placeholder="Ex: Parcela de dezembro"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
              >
                Adicionar Pagamento
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar pagamentos */}
      <Dialog open={isPaymentsListOpen} onOpenChange={setIsPaymentsListOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#1E3A8A' }}>
              Histórico de Pagamentos - {selectedFinancing?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {payments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nenhum pagamento registrado ainda.
              </p>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.paymentDate)}</p>
                    {payment.description && (
                      <p className="text-sm text-gray-500">{payment.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePayment(payment.id!)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
