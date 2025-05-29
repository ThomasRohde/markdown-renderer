import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { usePWA } from '../hooks/usePWA';

interface HeaderProps {
  isEditor: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ isEditor, title }) => {
  const { theme, setTheme, isDark } = useTheme();
  const { canInstall, showInstallPrompt } = usePWA();

  const handleThemeToggle = () => {
    const themes: ['light', 'dark', 'system'] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleInstall = async () => {
    await showInstallPrompt();
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4" />;
    }
    return isDark ? (
      <Moon className="w-4 h-4" />
    ) : (
      <Sun className="w-4 h-4" />
    );
  };
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">        <div className="flex items-center space-x-3 mb-3 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center app-icon shadow-md">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-full">
              {isEditor ? 'Markdown Document Viewer' : (title || 'Document Viewer')}
            </h1>
            {!isEditor && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Shared document
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="btn-icon"
            title={`Current theme: ${theme}`}
            aria-label="Toggle theme"
          >
            {getThemeIcon()}
          </button>

          {/* Install PWA Button */}
          {canInstall && (
            <button
              onClick={handleInstall}
              className="btn-small"
            >
              Install
            </button>
          )}

          {!isEditor && (
            <button
              onClick={() => window.location.href = window.location.origin + window.location.pathname}
              className="btn-primary text-xs sm:text-sm"
            >
              Create New
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
