import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleItemClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // On mobile, close the TOC after clicking an item
    if (isMobile) {
      setTimeout(() => onToggle(), 300);
    }
  };

  if (items.length === 0) {
    return null;
  }
    return (
    <>
      {/* TOC Toggle Button - Hidden on mobile, hidden when open */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="btn-icon-lg fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden sm:flex"
          title="Toggle Table of Contents"
          aria-label="Toggle Table of Contents"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}{/* TOC Panel - iOS styled for mobile */}
      {isOpen && (
        <div className={`
          fixed sm:left-4 sm:top-16 sm:bottom-16 sm:w-64 
          ${isMobile ? 'inset-x-0 bottom-0 top-auto max-h-[80vh] rounded-t-2xl' : 'inset-y-0 inset-x-0 sm:inset-auto sm:rounded-lg'}
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          shadow-xl z-30 overflow-hidden flex flex-col
          ${isMobile ? 'pb-safe' : ''}
        `} style={isMobile ? {boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.12)'} : {}}>
          {/* Drag handle for mobile - iOS style */}
          {isMobile && (
            <div className="w-full h-1.5 flex items-center justify-center p-3">
              <div className="w-14 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          )}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Table of Contents
            </h3>
            <button
              onClick={onToggle}
              className="btn-icon sm:hidden p-2"
              aria-label="Close table of contents"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 pb-safe">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full text-left px-2 py-2 sm:py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 
                  ${item.level === 1 ? 'font-semibold text-gray-900 dark:text-white' : ''}
                  ${item.level === 2 ? 'font-medium text-gray-800 dark:text-gray-200 ml-2' : ''}
                  ${item.level === 3 ? 'text-gray-700 dark:text-gray-300 ml-4' : ''}
                  ${item.level === 4 ? 'text-gray-600 dark:text-gray-400 ml-6' : ''}
                  ${item.level === 5 ? 'text-gray-500 dark:text-gray-500 ml-8' : ''}
                  ${item.level === 6 ? 'text-gray-500 dark:text-gray-500 ml-10' : ''}
                  ${isMobile ? 'mb-1 active:bg-gray-200 dark:active:bg-gray-600' : ''}
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

      {/* Backdrop - with blur on mobile */}
      {isOpen && (
        <div 
          className={`fixed inset-0 z-20 ${isMobile ? 'bg-black/50 backdrop-blur-sm' : ''}`}
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};
