import React from 'react';

interface TOCItem {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, isOpen, onToggle }) => {
  const handleItemClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* TOC Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 w-10 h-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500"
        title="Toggle Table of Contents"
        aria-label="Toggle Table of Contents"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* TOC Panel */}
      {isOpen && (
        <div className="fixed left-4 top-16 bottom-16 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-30 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Table of Contents
            </h3>
          </div>
          
          <div className="overflow-y-auto max-h-full p-2">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                  ${item.level === 1 ? 'font-semibold text-gray-900 dark:text-white' : ''}
                  ${item.level === 2 ? 'font-medium text-gray-800 dark:text-gray-200 ml-2' : ''}
                  ${item.level === 3 ? 'text-gray-700 dark:text-gray-300 ml-4' : ''}
                  ${item.level === 4 ? 'text-gray-600 dark:text-gray-400 ml-6' : ''}
                  ${item.level === 5 ? 'text-gray-500 dark:text-gray-500 ml-8' : ''}
                  ${item.level === 6 ? 'text-gray-500 dark:text-gray-500 ml-10' : ''}
                `}
                title={item.text}
              >
                <span className="block truncate">
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};
