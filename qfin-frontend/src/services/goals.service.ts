import { API_CONFIG, getAuthHeaders } from '../config/api';
import { Goal } from '../types';

// Tipos para requisições
export interface CreateGoalRequest {
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  type: Goal['type'];
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {}

class GoalsService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Obter todas as metas do usuário
  async getGoals(token: string): Promise<Goal[]> {
    try {
      const response = await fetch(`${this.baseURL}/goals`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar metas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  // Criar nova meta
  async createGoal(token: string, goal: CreateGoalRequest): Promise<Goal | null> {
    try {
      const response = await fetch(`${this.baseURL}/goals`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar meta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  }

  // Atualizar meta
  async updateGoal(token: string, id: number, goal: UpdateGoalRequest): Promise<Goal | null> {
    try {
      const response = await fetch(`${this.baseURL}/goals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar meta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating goal:', error);
      return null;
    }
  }

  // Deletar meta
  async deleteGoal(token: string, id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/goals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  // Obter meta por ID
  async getGoalById(token: string, id: number): Promise<Goal | null> {
    try {
      const response = await fetch(`${this.baseURL}/goals/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar meta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching goal:', error);
      return null;
    }
  }
}

export const goalsService = new GoalsService();
