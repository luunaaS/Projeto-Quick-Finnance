import { API_CONFIG, getAuthHeaders } from '../config/api';

// Tipos para transações
export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface CreateTransactionRequest {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
}

class TransactionsService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Obter todas as transações do usuário
  async getTransactions(token: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
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
    token: string,
    transaction: CreateTransactionRequest
  ): Promise<Transaction | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
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
    token: string,
    id: number,
    transaction: Partial<CreateTransactionRequest>
  ): Promise<Transaction | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
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
  async deleteTransaction(token: string, id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  // Obter estatísticas
  async getStatistics(token: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
  } | null> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/statistics`, {
        method: 'GET',
        headers: getAuthHeaders(token),
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
