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
  const [readReceipts, setReadReceipts] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

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

  const toggleReadReceipts = () => setReadReceipts(prev => !prev);
  const dismissOnboarding = () => setHasSeenOnboarding(true);
  const resetOnboarding = () => setHasSeenOnboarding(false);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      language,
      notifications,
      readReceipts,
      hasSeenOnboarding,
      login,
      logout,
      updateProfile,
      toggleLanguage,
      updateNotifications,
      toggleReadReceipts,
      dismissOnboarding,
      resetOnboarding,
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
