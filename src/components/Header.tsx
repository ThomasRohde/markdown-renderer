import React from 'react';
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
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    return isDark ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
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
