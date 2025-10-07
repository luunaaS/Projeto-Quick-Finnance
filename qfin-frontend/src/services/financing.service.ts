import { API_CONFIG, getAuthHeaders } from '../config/api';

export interface Financing {
  id?: number;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  type: string;
  endDate: string;
}

class FinancingService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getToken(): string | null {
    return localStorage.getItem('qfin_token');
  }

  async getAllFinancings(): Promise<Financing[]> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch financings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching financings:', error);
      throw error;
    }
  }

  async getFinancingById(id: number): Promise<Financing> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch financing');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching financing:', error);
      throw error;
    }
  }

  async createFinancing(financing: Financing): Promise<Financing> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(financing),
      });

      if (!response.ok) {
        throw new Error('Failed to create financing');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating financing:', error);
      throw error;
    }
  }

  async updateFinancing(id: number, financing: Financing): Promise<Financing> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(financing),
      });

      if (!response.ok) {
        throw new Error('Failed to update financing');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating financing:', error);
      throw error;
    }
  }

  async deleteFinancing(id: number): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No token found');

      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.FINANCINGS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to delete financing');
      }
    } catch (error) {
      console.error('Error deleting financing:', error);
      throw error;
    }
  }
}

export const financingService = new FinancingService();
