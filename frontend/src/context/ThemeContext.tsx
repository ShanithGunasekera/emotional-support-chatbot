import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

// Light theme with dark buttons
const lightColors = {
  background: '#FFFFFF', // Pure white background
  card: '#F8FAFC', // Very light gray for cards
  text: '#1E293B', // Dark text
  textSecondary: '#64748B', // Medium gray for secondary text
  primary: '#1E293B', // Dark color for buttons
  border: '#E2E8F0', // Light borders
  success: '#059669', // Green
  warning: '#D97706', // Amber
  error: '#DC2626', // Red
};

const darkColors = {
  background: '#0F172A', // Dark background
  card: '#1E293B', // Dark cards
  text: '#F1F5F9', // Light text
  textSecondary: '#94A3B8', // Light gray for secondary text
  primary: '#F1F5F9', // Light color for buttons
  border: '#334155', // Dark borders
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false); // Default to light theme

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};