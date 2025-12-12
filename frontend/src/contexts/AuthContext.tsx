import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '@/lib/api';

// Define a placeholder for the user object type.
// You should replace `any` with a proper User interface.
interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // The API client interceptor will automatically add the token to the header.
          const response = await api.get('/user/me/'); // Endpoint to get current user info
          setUser(response.data.user);
        } catch (error) {
          console.error("Session expired or token is invalid. Logging out.");
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, []);

  const login = (token: string, newUser: User) => {
    localStorage.setItem('authToken', token);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    // Redirect to login page after logout to prevent access to protected routes.
    window.location.href = '/login';
  };

  const value: AuthContextType = { user, login, logout, isLoading };

  // Don't render the app until we've checked for an existing session.
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};