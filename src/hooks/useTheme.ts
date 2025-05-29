import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from storage
  useEffect(() => {
    const initTheme = async () => {
      try {
        const settings = await storage.getSettings();
        setTheme(settings.theme);
      } catch (error) {
        console.warn('Failed to load theme from storage:', error);
        // Fallback to system theme
        setTheme('system');
      }
    };
    initTheme();
  }, []);  // Update resolved theme when theme changes or system preference changes
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const newResolvedTheme = systemPrefersDark ? 'dark' : 'light';
        setResolvedTheme(newResolvedTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  const changeTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    
    try {
      const settings = await storage.getSettings();
      await storage.saveSettings({
        ...settings,
        theme: newTheme,
      });
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme: changeTheme,
    isDark: resolvedTheme === 'dark',
  };
}
