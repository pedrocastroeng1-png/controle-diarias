import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../lib/types';
import { api } from '../lib/api';

interface AuthContextType {
  usuario: Usuario | null;
  login: (usuario: string, senha: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('@diarias:usuario');
    if (storedUser) {
      try {
        setUsuario(JSON.parse(storedUser));
      } catch (e) {
        /* suppress console error */
      }
    }
    setLoading(false);
  }, []);

  const login = async (user: string, pass: string) => {
    setLoading(true);
    try {
      const u = await api.login(user, pass);
      if (u) {
        setUsuario(u);
        localStorage.setItem('@diarias:usuario', JSON.stringify(u));
        return true;
      }
      return false;
    } catch (e) {
      /* suppress login console error */
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('@diarias:usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
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
