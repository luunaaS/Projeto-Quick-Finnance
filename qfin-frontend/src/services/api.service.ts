import { API_CONFIG, getAuthHeaders } from '../config/api';
import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest,
  UpdateProfileRequest,
  AuthResponse 
} from '../types';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Método genérico para fazer requisições
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // O backend pode retornar 'error' ou 'message'
        const errorMessage = data.error || data.message || 'Erro na requisição';
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Login
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Registro
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Logout
  async logout(token: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
  }

  // Obter dados do usuário atual
  async getCurrentUser(token: string): Promise<ApiResponse<AuthResponse['user']>> {
    return this.request<AuthResponse['user']>(API_CONFIG.ENDPOINTS.ME, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Update profile
  async updateProfile(userData: UpdateProfileRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(`${API_CONFIG.ENDPOINTS.LOGIN.replace('/login', '/profile')}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
}

export const apiService = new ApiService();
