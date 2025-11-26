import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qfin_token');
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

// Função auxiliar para download de arquivos
const downloadFile = (blob: Blob, filename: string, mimeType?: string) => {
  // Criar um novo Blob com o tipo MIME correto se especificado
  const fileBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob;
  
  const url = window.URL.createObjectURL(fileBlob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  // Limpar
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const reportsService = {
  async getTransactions(filters: ReportRequest) {
    const response = await api.post('/reports/transactions', filters);
    return response.data;
  },

  async getSummary(filters: ReportRequest): Promise<ReportSummary> {
    const response = await api.post('/reports/summary', filters);
    return response.data;
  },

  async exportTransactionsCSV(filters: ReportRequest) {
    try {
      const response = await api.post('/reports/export/transactions/csv', filters, {
        responseType: 'blob',
      });
      
      // response.data já é um Blob quando responseType é 'blob'
      downloadFile(response.data, 'transacoes.csv', 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('Erro ao exportar transações CSV:', error);
      throw error;
    }
  },

  async exportFinancingsCSV() {
    try {
      const response = await api.get('/reports/export/financings/csv', {
        responseType: 'blob',
      });
      
      // response.data já é um Blob quando responseType é 'blob'
      downloadFile(response.data, 'financiamentos.csv', 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('Erro ao exportar financiamentos CSV:', error);
      throw error;
    }
  },

  async exportPDF(filters: ReportRequest) {
    try {
      const response = await api.post('/reports/export/pdf', filters, {
        responseType: 'blob',
      });
      
      // response.data já é um Blob quando responseType é 'blob'
      downloadFile(response.data, 'relatorio.pdf', 'application/pdf');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  },
};
