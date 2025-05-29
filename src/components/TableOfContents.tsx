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
      {/* TOC Toggle Button - Hidden on mobile */}
      <button
        onClick={onToggle}
        className="btn-icon-lg fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden sm:flex"
        title="Toggle Table of Contents"
        aria-label="Toggle Table of Contents"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile TOC Button - Bottom right */}
      <button
        onClick={onToggle}
        className="fixed sm:hidden right-4 bottom-16 btn-icon-lg shadow-lg z-40 bg-blue-600 text-white dark:bg-blue-600"
        title="Table of Contents"
        aria-label="Open Table of Contents"  
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* TOC Panel */}
      {isOpen && (
        <div className="fixed sm:left-4 sm:top-16 sm:bottom-16 sm:w-64 inset-y-0 inset-x-0 sm:inset-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 sm:rounded-lg shadow-lg z-30 overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Table of Contents
            </h3>
            <button
              onClick={onToggle}
              className="btn-icon sm:hidden p-1"
              aria-label="Close table of contents"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  handleItemClick(item.id);
                  // On mobile, close the TOC after clicking an item
                  if (window.innerWidth < 640) {
                    onToggle();
                  }
                }}
                className={`
                  w-full text-left px-2 py-2 sm:py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 
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
