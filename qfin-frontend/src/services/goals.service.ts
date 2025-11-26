import { API_CONFIG, getAuthHeaders } from '../config/api';
import type { Goal, CreateGoalRequest } from '../types';

class GoalsService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Obter todas as metas do usuário
  async getAllGoals(): Promise<Goal[]> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.GOALS}`, {
        method: 'GET',
        headers: getAuthHeaders(),
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

  // Obter meta por ID
  async getGoalById(id: number): Promise<Goal | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.GOALS}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
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

  // Criar nova meta
  async createGoal(goal: CreateGoalRequest): Promise<Goal | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.GOALS}`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
  async updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.GOALS}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
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

  // Adicionar valor à meta
  async addToGoal(id: number, amount: number): Promise<Goal | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.GOALS}/${id}/add`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Erro ao adicionar valor à meta';
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to goal:', error);
      throw error;
    }
  }

  // Deletar meta
  async deleteGoal(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.GOALS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  // Marcar meta como completa
  async completeGoal(id: number): Promise<Goal | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.GOALS}/${id}/complete`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao completar meta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing goal:', error);
      return null;
    }
  }
}

export const goalsService = new GoalsService();
