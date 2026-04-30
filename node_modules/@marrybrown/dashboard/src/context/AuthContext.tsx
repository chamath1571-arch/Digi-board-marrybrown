import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@marrybrown/shared';

interface AuthContextType {
  user: User | null;
  login: (payrollId: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  canEdit: (module: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:4000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('marrybrown_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('marrybrown_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (payrollId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payrollId }),
      });

      const data = await response.json();
      
      if (data.success && data.data.user) {
        setUser(data.data.user);
        localStorage.setItem('marrybrown_user', JSON.stringify(data.data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('marrybrown_user');
  };

  const canEdit = (module: string): boolean => {
    if (!user) return false;
    
    // Modules editable only by shift_manager and head_staff
    const restrictedModules = ['weekly-roster', 'daily-shifts', 'notes-alerts'];
    
    if (restrictedModules.includes(module)) {
      return user.role === 'shift_manager' || user.role === 'head_staff';
    }
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, canEdit, isLoading }}>
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