import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ReportRequest {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: 'INCOME' | 'EXPENSE' | 'ALL';
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  transactionCount: number;
  type: string;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalTransactions: number;
  categoryBreakdown: CategorySummary[];
}

export const reportsService = {
  async getTransactions(filters: ReportRequest) {
    const response = await api.post('/api/reports/transactions', filters);
    return response.data;
  },

  async getSummary(filters: ReportRequest): Promise<ReportSummary> {
    const response = await api.post('/api/reports/summary', filters);
    return response.data;
  },

  async exportTransactionsCSV(filters: ReportRequest) {
    const response = await api.post('/api/reports/export/transactions/csv', filters, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transacoes.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportFinancingsCSV() {
    const response = await api.get('/api/reports/export/financings/csv', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'financiamentos.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async exportPDF(filters: ReportRequest) {
    const response = await api.post('/api/reports/export/pdf', filters, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
