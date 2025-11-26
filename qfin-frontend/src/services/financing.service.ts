import { API_CONFIG, getAuthHeaders } from '../config/api';
import type { Financing } from '../types';

class FinancingService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async getAllFinancings(): Promise<Financing[]> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar financiamentos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching financings:', error);
      return [];
    }
  }

  async getFinancingById(id: number): Promise<Financing | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar financiamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching financing:', error);
      return null;
    }
  }

  async createFinancing(financing: Omit<Financing, 'id'>): Promise<Financing | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(financing),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar financiamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating financing:', error);
      return null;
    }
  }

  async updateFinancing(id: number, financing: Partial<Financing>): Promise<Financing | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(financing),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar financiamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating financing:', error);
      return null;
    }
  }

  async deleteFinancing(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting financing:', error);
      return false;
    }
  }
}

export const financingService = new FinancingService();

  async getPaymentsByFinancing(financingId: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${financingId}/payments`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pagamentos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  async addPayment(financingId: number, payment: any): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${financingId}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payment),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar pagamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding payment:', error);
      return null;
    }
  }

  async deletePayment(financingId: number, paymentId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${financingId}/payments/${paymentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting payment:', error);
      return false;
    }
  }
