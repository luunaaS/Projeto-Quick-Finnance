import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { useAuth } from '../contexts/AuthContext';
import { goalsService } from '../services/goals.service';
import type { Goal } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Plus, Target, DollarSign, TrendingUp, CheckCircle, Calendar, Trash2 } from 'lucide-react';

export function Goals() {
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMoneyDialogOpen, setIsAddMoneyDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [addAmount, setAddAmount] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
    }
  }, [isAuthenticated]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsService.getAllGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !targetAmount || !deadline || !category) return;

    try {
      const created = await goalsService.createGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount),
        deadline,
        category,
        description: description || undefined,
      });

      if (created) {
        setGoals(prev => [created, ...prev]);
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleAddMoney = async () => {
    if (!selectedGoal || !addAmount) {
      alert('Por favor, insira um valor válido');
      return;
    }

    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor maior que zero');
      return;
    }

    try {
      const updated = await goalsService.addToGoal(selectedGoal.id!, amount);
      if (updated) {
        setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
        setAddAmount('');
        setIsAddMoneyDialogOpen(false);
        setSelectedGoal(null);
        alert('Valor adicionado com sucesso!');
      } else {
        alert('Erro ao adicionar valor à meta');
      }
    } catch (error: any) {
      console.error('Error adding money to goal:', error);
      const errorMessage = error?.message || 'Erro ao adicionar valor à meta';
      alert(errorMessage);
    }
  };

  const handleCompleteGoal = async (id: number) => {
    try {
      const updated = await goalsService.completeGoal(id);
      if (updated) {
        setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
      }
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      const success = await goalsService.deleteGoal(id);
      if (success) {
        setGoals(prev => prev.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setCategory('');
    setDescription('');
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-600">Concluída</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-600">Cancelada</Badge>;
      default:
        return <Badge className="bg-blue-600">Em Progresso</Badge>;
    }
  };

  const activeGoals = goals.filter(g => g.status === 'IN_PROGRESS');
  const completedGoals = goals.filter(g => g.status === 'COMPLETED');
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
            <p className="text-gray-600 mt-2">Defina e acompanhe seus objetivos financeiros</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#1E3A8A' }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle style={{ color: '#1E3A8A' }}>Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Meta</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Viagem para Europa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Valor Alvo</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentAmount">Valor Inicial</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Prazo</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Viagem">Viagem</SelectItem>
                        <SelectItem value="Educação">Educação</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Veículo">Veículo</SelectItem>
                        <SelectItem value="Investimento">Investimento</SelectItem>
                        <SelectItem value="Emergência">Emergência</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva sua meta..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" style={{ backgroundColor: '#1E3A8A' }}>
                  Criar Meta
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeGoals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Economizado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalSaved)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalTarget)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedGoals.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Metas */}
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">Carregando metas...</p>
            </CardContent>
          </Card>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Você ainda não tem metas financeiras cadastradas.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} style={{ backgroundColor: '#1E3A8A' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const isOverdue = daysRemaining < 0 && goal.status === 'IN_PROGRESS';

              return (
                <Card key={goal.id} className="border shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="secondary">{goal.category}</Badge>
                        </CardDescription>
                      </div>
                      {getStatusBadge(goal.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {goal.description && (
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progresso</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="text-gray-600">
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {isOverdue 
                          ? `Atrasado ${Math.abs(daysRemaining)} dias`
                          : goal.status === 'COMPLETED'
                          ? `Concluída em ${formatDate(goal.deadline)}`
                          : `${daysRemaining} dias restantes`
                        }
                      </span>
                    </div>

                    {goal.status === 'IN_PROGRESS' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          style={{ backgroundColor: '#059669' }}
                          onClick={() => {
                            setSelectedGoal(goal);
                            setIsAddMoneyDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                        {progress >= 100 && (
                          <Button
                            size="sm"
                            className="flex-1"
                            style={{ backgroundColor: '#1E3A8A' }}
                            onClick={() => handleCompleteGoal(goal.id!)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteGoal(goal.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {goal.status === 'COMPLETED' && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          Meta alcançada! 🎉
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialog para adicionar dinheiro */}
        <Dialog open={isAddMoneyDialogOpen} onOpenChange={setIsAddMoneyDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle style={{ color: '#1E3A8A' }}>
                Adicionar à Meta: {selectedGoal?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addAmount">Valor a Adicionar</Label>
                <Input
                  id="addAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  style={{ backgroundColor: '#1E3A8A' }}
                  onClick={handleAddMoney}
                >
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAddMoneyDialogOpen(false);
                    setAddAmount('');
                    setSelectedGoal(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
