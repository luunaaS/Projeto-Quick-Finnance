import { API_CONFIG, getAuthHeaders } from '../config/api';
import type { Transaction, CreateTransactionRequest, Statistics } from '../types';

class TransactionsService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Obter todas as transações do usuário
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar transações');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  // Criar nova transação
  async createTransaction(
    transaction: CreateTransactionRequest
  ): Promise<Transaction | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar transação');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  // Atualizar transação
  async updateTransaction(
    id: number,
    transaction: Partial<CreateTransactionRequest>
  ): Promise<Transaction | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar transação');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  }

  // Deletar transação
  async deleteTransaction(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  // Obter estatísticas
  async getStatistics(): Promise<Statistics | null> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/statistics`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }
  }
}

export const transactionsService = new TransactionsService();
