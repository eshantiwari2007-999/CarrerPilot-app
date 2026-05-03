import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../../services/api';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await authService.getMe();
      setUser(response.data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
    };

    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      toast.error(customEvent.detail || 'An unexpected error occurred.');
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    window.addEventListener('api-error', handleApiError);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
      window.removeEventListener('api-error', handleApiError);
    };
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('auth_token', token);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
