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
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuração: true para usar API backend, false para usar localStorage
const USE_BACKEND_API = false; // Altere para true quando tiver o backend pronto

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sessão existente ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('qfin_token');
      const storedUser = localStorage.getItem('qfin_user');

      if (storedToken && storedUser) {
        if (USE_BACKEND_API) {
          // Validar token com o backend
          const response = await apiService.getCurrentUser(storedToken);
          if (response.success && response.data) {
            setUser(response.data);
            setToken(storedToken);
          } else {
            // Token inválido, limpar
            localStorage.removeItem('qfin_token');
            localStorage.removeItem('qfin_user');
          }
        } else {
          // Modo localStorage
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (USE_BACKEND_API) {
        // Login via API
        const response = await apiService.login({ email, password });
        
        if (response.success && response.data) {
          const { user: userData, token: authToken } = response.data;
          
          setUser(userData);
          setToken(authToken);
          
          localStorage.setItem('qfin_token', authToken);
          localStorage.setItem('qfin_user', JSON.stringify(userData));
          
          return true;
        }
        return false;
      } else {
        // Login via localStorage (modo demo)
        const storedUsers = localStorage.getItem('qfin_users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        
        const foundUser = users.find(
          (u: any) => u.email === email && u.password === password
        );

        if (foundUser) {
          const userData = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
          };
          
          const mockToken = `mock_token_${Date.now()}`;
          
          setUser(userData);
          setToken(mockToken);
          
          localStorage.setItem('qfin_token', mockToken);
          localStorage.setItem('qfin_user', JSON.stringify(userData));
          
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (USE_BACKEND_API) {
        // Registro via API
        const response = await apiService.register({ name, email, password });
        
        if (response.success && response.data) {
          const { user: userData, token: authToken } = response.data;
          
          setUser(userData);
          setToken(authToken);
          
          localStorage.setItem('qfin_token', authToken);
          localStorage.setItem('qfin_user', JSON.stringify(userData));
          
          return true;
        }
        return false;
      } else {
        // Registro via localStorage (modo demo)
        const storedUsers = localStorage.getItem('qfin_users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        
        const existingUser = users.find((u: any) => u.email === email);
        if (existingUser) {
          return false;
        }

        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password,
        };

        users.push(newUser);
        localStorage.setItem('qfin_users', JSON.stringify(users));

        const userData = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        };
        
        const mockToken = `mock_token_${Date.now()}`;
        
        setUser(userData);
        setToken(mockToken);
        
        localStorage.setItem('qfin_token', mockToken);
        localStorage.setItem('qfin_user', JSON.stringify(userData));
        
        return true;
      }
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    if (USE_BACKEND_API && token) {
      // Notificar o backend sobre o logout
      await apiService.logout(token);
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('qfin_token');
    localStorage.removeItem('qfin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
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
