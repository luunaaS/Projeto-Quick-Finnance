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
    GOALS: '/goals',
  },
  
  // Timeout para requisições (em ms)
  TIMEOUT: 10000,
};

// Headers padrão para requisições
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Se não foi passado um token, tenta pegar do localStorage
  const authToken = token || localStorage.getItem('qfin_token');
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};
