import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'coach' | 'client';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'coach' | 'client') => Promise<void>;
  registerWithInvite: (email: string, password: string, name: string, inviteId: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for authenticated user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Real login function using API
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authAPI.login({ email, password });
      setUser(userData);
      toast.success('Logged in successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real register function using API
  const register = async (email: string, password: string, name: string, role: 'coach' | 'client') => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authAPI.register({ email, password, name, role });
      setUser(userData);
      toast.success('Account created successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Register with invite (this is more complex and would need an invite API)
  const registerWithInvite = async (email: string, password: string, name: string, inviteId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // This would need to be implemented with an invite system API
      // For now, just register as a client
      const userData = await authAPI.register({ 
        email, 
        password, 
        name, 
        role: 'client',
      });
      
      setUser(userData);
      toast.success('Account created successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    registerWithInvite,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
