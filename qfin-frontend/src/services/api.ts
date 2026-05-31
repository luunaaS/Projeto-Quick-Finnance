const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('qfin_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('qfin_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('qfin_token');
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user?: { id: number; name: string; email: string } }> {
    const data = await this.request<{ token: string; user?: { id: number; name: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(name: string, email: string, password: string): Promise<{ token: string; user?: { id: number; name: string; email: string } }> {
    const data = await this.request<{ token: string; user?: { id: number; name: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  // Dashboard
  async getDashboard(): Promise<any> {
    return this.request('/dashboard');
  }

  // Transactions
  async getTransactions(): Promise<any[]> {
    return this.request('/transactions');
  }

  async createTransaction(transaction: any): Promise<any> {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, transaction: any): Promise<any> {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Financings
  async getFinancings(): Promise<any[]> {
    return this.request('/financings');
  }

  async createFinancing(financing: any): Promise<any> {
    return this.request('/financings', {
      method: 'POST',
      body: JSON.stringify(financing),
    });
  }

  async updateFinancing(id: string, financing: any): Promise<any> {
    return this.request(`/financings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(financing),
    });
  }

  async deleteFinancing(id: string): Promise<void> {
    return this.request(`/financings/${id}`, {
      method: 'DELETE',
    });
  }

  // Investments
  async getInvestments(): Promise<any[]> {
    return this.request('/investments');
  }

  async createInvestment(investment: any): Promise<any> {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify(investment),
    });
  }

  async updateInvestment(id: string, investment: any): Promise<any> {
    return this.request(`/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(investment),
    });
  }

  async deleteInvestment(id: string): Promise<void> {
    return this.request(`/investments/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    return this.request('/notifications');
  }

  async getUnreadNotifications(): Promise<any[]> {
    return this.request('/notifications/unread');
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return this.request('/notifications/count');
  }

  async markNotificationAsRead(id: string): Promise<any> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async getNotificationSettings(): Promise<any> {
    return this.request('/notifications/settings');
  }

  async updateNotificationSettings(settings: any): Promise<any> {
    return this.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Multi-currency
  async getMultiCurrencyTransactions(): Promise<any[]> {
    return this.request('/multi-currency/transactions');
  }

  async createMultiCurrencyTransaction(transaction: any): Promise<any> {
    return this.request('/multi-currency/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateMultiCurrencyTransaction(id: string, transaction: any): Promise<any> {
    return this.request(`/multi-currency/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteMultiCurrencyTransaction(id: string): Promise<void> {
    return this.request(`/multi-currency/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getExchangeRates(): Promise<any[]> {
    return this.request('/multi-currency/exchange-rates');
  }

  async convertCurrency(from: string, to: string, amount: number): Promise<{ rate: number; convertedAmount: number }> {
    return this.request(`/multi-currency/convert?from=${from}&to=${to}&amount=${amount}`);
  }

  // Profile
  async getProfile(): Promise<{ id: number; name: string; email: string; phone?: string; bio?: string; birthDate?: string; profileImageBase64?: string | null }> {
    return this.request('/auth/profile');
  }

  async updateProfile(
    name: string,
    email: string,
    phone?: string,
    bio?: string,
    birthDate?: string
  ): Promise<{ token: string; user: { id: number; name: string; email: string; phone?: string; bio?: string; birthDate?: string; profileImageBase64?: string | null } }> {
    const data = await this.request<{ token: string; user: { id: number; name: string; email: string; phone?: string; bio?: string; birthDate?: string; profileImageBase64?: string | null } }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email, phone, bio, birthDate }),
    });
    if (data?.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async updateProfileDetails(payload: {
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    birthDate?: string;
  }): Promise<{ token?: string; user: { id: number; name: string; email: string; phone?: string; bio?: string; birthDate?: string; profileImageBase64?: string | null } }> {
    const data = await this.request<{ token?: string; user: { id: number; name: string; email: string; phone?: string; bio?: string; birthDate?: string; profileImageBase64?: string | null } }>('/auth/profile/details', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (data?.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async updateProfilePhoto(profileImageBase64: string): Promise<{ user: { id: number; name: string; email: string; phone?: string; bio?: string; birthDate?: string; profileImageBase64?: string | null } }> {
    return this.request('/auth/profile/photo', {
      method: 'PUT',
      body: JSON.stringify({ profileImageBase64 }),
    });
  }

  async deleteProfilePhoto(): Promise<{ user: { id: number; name: string; email: string; phone?: string; bio?: string; birthDate?: string; profileImageBase64?: string | null } }> {
    return this.request('/auth/profile/photo', {
      method: 'DELETE',
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Recurring Transactions
  async getRecurringTransactions(): Promise<any[]> {
    return this.request('/recurring-transactions');
  }

  async createRecurringTransaction(transaction: any): Promise<any> {
    return this.request('/recurring-transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateRecurringTransaction(id: string, transaction: any): Promise<any> {
    return this.request(`/recurring-transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async toggleRecurringTransaction(id: string): Promise<any> {
    return this.request(`/recurring-transactions/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async deleteRecurringTransaction(id: string): Promise<void> {
    return this.request(`/recurring-transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports
  async getReportSummary(startDate: string, endDate: string): Promise<any> {
    return this.request('/reports/summary', {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    });
  }

  async exportTransactionsCSV(startDate: string, endDate: string): Promise<Blob> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const response = await fetch(`${API_BASE_URL}/reports/export/transactions/csv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) {
      throw new Error(`Erro ao exportar CSV (${response.status})`);
    }
    return response.blob();
  }

  async exportReportPDF(startDate: string, endDate: string): Promise<Blob> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const response = await fetch(`${API_BASE_URL}/reports/export/pdf`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) {
      throw new Error(`Erro ao exportar PDF (${response.status})`);
    }
    return response.blob();
  }
}

export const api = new ApiService();
export default api;
