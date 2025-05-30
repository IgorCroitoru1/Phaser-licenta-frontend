"use client"

// contexts/auth-context.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserDto } from '@/dtos/UserDto';
import { globalAuth } from '@/lib/globalAuth';

interface AuthContextType {
  user: UserDto | null;
  accessToken: string | null;
  isAuthLoading: boolean;
  setAuthLoading: (isLoading: boolean) => void;
  login: (token: string, user: UserDto) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  setUser: (user: UserDto | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserDto | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setAccessTokenState(storedToken);
          setUserState(parsedUser);
          
          // Initialize global auth with the same state
          globalAuth.login(storedToken, parsedUser);
        }
      } catch (error) {
        console.error('Error initializing auth from localStorage:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsAuthLoading(false);
        globalAuth.setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);
  const login = (token: string, userData: UserDto) => {
    setAccessTokenState(token);
    setUserState(userData);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Sync with global auth
    globalAuth.login(token, userData);
  };

  const setAccessToken = (token: string) => {
    setAccessTokenState(token);
    localStorage.setItem('accessToken', token);
    
    // Sync with global auth
    globalAuth.setAccessToken(token);
  };

  const logout = () => {
    setAccessTokenState(null);
    setUserState(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Sync with global auth
    globalAuth.logout();
  };

  const setUser = (userData: UserDto | null) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
    
    // Sync with global auth
    globalAuth.setUser(userData);
  };

  const setAuthLoading = (isLoading: boolean) => {
    setIsAuthLoading(isLoading);
    
    // Sync with global auth
    globalAuth.setAuthLoading(isLoading);
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthLoading,
    setAuthLoading,
    login,
    setAccessToken,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};