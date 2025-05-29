import React from 'react';

interface HeaderProps {
  isEditor: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ isEditor, title }) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditor ? 'Markdown Document Viewer' : (title || 'Document Viewer')}
            </h1>
            {!isEditor && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Shared document
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditor && (
            <button
              onClick={() => window.location.href = window.location.origin + window.location.pathname}
              className="px-4 py-2 text-sm bg-github-blue text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create New
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
