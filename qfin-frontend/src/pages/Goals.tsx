import React, { useState, useEffect } from 'react';
import { goalsService, CreateGoalRequest } from '../services/goals.service';
import { Goal } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Goals: React.FC = () => {
  const { token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    type: 'SAVINGS' as Goal['type']
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    if (!token) return;

    try {
      const data = await goalsService.getGoals(token);
      setGoals(data);
    } catch (err) {
      setError('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const goalData: CreateGoalRequest = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        targetDate: new Date(formData.targetDate).toISOString().split('T')[0]
      };

      if (editingGoal) {
        await goalsService.updateGoal(token, editingGoal.id, goalData);
      } else {
        await goalsService.createGoal(token, goalData);
      }

      fetchGoals();
      resetForm();
    } catch (err) {
      setError('Erro ao salvar meta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await goalsService.deleteGoal(token, id);
        fetchGoals();
      } catch (err) {
        setError('Erro ao excluir meta');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      type: 'SAVINGS'
    });
    setEditingGoal(null);
    setShowForm(false);
  };

  const startEdit = (goal: Goal) => {
    setFormData({
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      type: goal.type
    });
    setEditingGoal(goal);
    setShowForm(true);
  };

  const calculateProgress = (current: number, target: number) => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Metas Financeiras</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancelar' : 'Nova Meta'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingGoal ? 'Editar Meta' : 'Nova Meta'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as Goal['type']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SAVINGS">Poupança</option>
                <option value="INVESTMENT">Investimento</option>
                <option value="DEBT_PAYMENT">Pagamento de Dívida</option>
                <option value="EMERGENCY_FUND">Fundo de Emergência</option>
                <option value="VACATION">Férias</option>
                <option value="CAR_PURCHASE">Compra de Carro</option>
                <option value="HOME_DOWN_PAYMENT">Entrada de Casa</option>
                <option value="EDUCATION">Educação</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Alvo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Atual (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Alvo
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingGoal ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          return (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{goal.name}</h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(goal)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progresso</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Atual:</span>
                  <span className="font-medium">R$ {goal.currentAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Alvo:</span>
                  <span className="font-medium">R$ {goal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Restante:</span>
                  <span className="font-medium">R$ {(goal.targetAmount - goal.currentAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Alvo:</span>
                  <span className="font-medium">{new Date(goal.targetDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{goal.type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma meta cadastrada. Clique em "Nova Meta" para começar.
        </div>
      )}
    </div>
  );
};

export default Goals;
