import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api.service';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('qfin_user');
    const storedToken = localStorage.getItem('qfin_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('qfin_user', JSON.stringify(userData));
        localStorage.setItem('qfin_token', authToken);
        
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Erro ao fazer login' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.register({ name, email, password });
      
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('qfin_user', JSON.stringify(userData));
        localStorage.setItem('qfin_token', authToken);
        
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Erro ao criar conta' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  };

  const updateProfile = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiService.updateProfile({ name, email });
      
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('qfin_user', JSON.stringify(userData));
        localStorage.setItem('qfin_token', authToken);
        
        return { success: true };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Erro ao atualizar perfil' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('qfin_user');
    localStorage.removeItem('qfin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user && !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
