// Configuração da API
export const API_CONFIG = {
  // URL do backend Spring Boot
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  
  // Endpoints de autenticação
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    TRANSACTIONS: '/transactions',
    FINANCINGS: '/financings',
  },
  
  // Timeout para requisições (em ms)
  TIMEOUT: 10000,
};

// Headers padrão para requisições
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
