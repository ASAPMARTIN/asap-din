import { createContext, useContext, useState } from 'react';
import { getCurrentUser } from '../data/mockUsers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Mock: app starts as if logged in (to show main screens)
  // In real app: check Supabase session
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [language, setLanguage] = useState('es');
  const [notifications, setNotifications] = useState({ pushEnabled: true, digestEnabled: false });

  const login = () => {
    setIsAuthenticated(true);
    setCurrentUser(getCurrentUser());
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const updateProfile = (updates) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const updateNotifications = (updates) => {
    setNotifications(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      language,
      notifications,
      login,
      logout,
      updateProfile,
      toggleLanguage,
      updateNotifications,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
