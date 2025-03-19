import { loginDoctor } from '@/services/auth-services';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Doctor {
  id: string;
  username: string;
  password: string;

}

interface AuthContextType {
  doctor: Doctor | null;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is logged in when page loads
  useEffect(() => {
    const checkAuth = () => {
      const storedDoctor = localStorage.getItem('doctor');
      const token = localStorage.getItem('access_token');
      const doctorId = localStorage.getItem('doctor_id');
      
      if (token && (storedDoctor || doctorId)) {
        if (storedDoctor) {
          setDoctor(JSON.parse(storedDoctor));
        }
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      // Call login API
      const response = await loginDoctor(credentials);
      
      // Make sure to store all necessary data consistently
      const doctorData = response.data.doctor;
      
      // Store doctor object
      localStorage.setItem('doctor', JSON.stringify(doctorData));
      
      // Store doctor_id separately for easy access
      localStorage.setItem('doctor_id', doctorData.doctor_id);
      
      // Store tokens
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token || '');
  
      setDoctor(doctorData as Doctor);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error('Login failed:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await fetch('/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  }

  const logout = () => {
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem('doctor');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    setDoctor(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ doctor, login, logout, isAuthenticated, isLoading }}>
      {children}
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