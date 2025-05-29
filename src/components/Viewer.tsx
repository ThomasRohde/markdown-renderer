import React, { useEffect, useState } from 'react';
import { useEncoding } from '../hooks/useEncoding';
import { useMarkdown } from '../hooks/useMarkdown';
import { QRModal } from './QRModal';
import { TableOfContents } from './TableOfContents';

interface ViewerProps {
  isReadingMode?: boolean;
  onToggleReadingMode?: () => void;
}

export const Viewer: React.FC<ViewerProps> = ({ 
  isReadingMode = false, 
  onToggleReadingMode 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [originalMarkdown, setOriginalMarkdown] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { decode, getFromUrl } = useEncoding();
  const { renderedHtml, title, tableOfContents, render } = useMarkdown();
  useEffect(() => {
    const loadDocument = async () => {
      const encoded = getFromUrl();
      
      if (!encoded) {
        setError('No document found in URL');
        setIsLoading(false);
        return;
      }

      try {
        const result = await decode(encoded);
        if (result.success) {
          setOriginalMarkdown(result.content);
          render(result.content);
        } else {
          setError(result.error || 'Failed to decode document');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [decode, getFromUrl, render]);

  // Update browser tab title when document title changes
  useEffect(() => {
    if (title && title !== 'Untitled Document') {
      document.title = `${title} - Markdown Viewer`;
    } else {
      document.title = 'Document - Markdown Viewer';
    }
  }, [title]);
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  const handleToggleFavorite = async () => {
    // Implementation for toggling favorite status
    try {
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);
      // Save to storage would go here
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };
  const handleEdit = () => {
    // Store the original markdown in localStorage for the editor to pick up
    localStorage.setItem('editContent', originalMarkdown);
    
    // Navigate to editor
    const baseUrl = window.location.origin + window.location.pathname;
    window.location.href = baseUrl;
  };

  if (isLoading) {
    return (      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Document
          </h2>          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = window.location.origin + window.location.pathname}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create New Document
          </button>
        </div>
      </div>
    );
  }  return (
    <div className={`flex-1 flex flex-col max-w-7xl mx-auto w-full ${isReadingMode ? 'reading-mode' : ''}`}>      {/* Reading Mode Toggle Button */}
      {isReadingMode && (
        <button
          onClick={onToggleReadingMode}
          className="fixed top-4 right-4 z-50 w-12 h-12 app-icon rounded-full flex items-center justify-center transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 app-icon-enter"
          title="Show app controls"
          aria-label="Show app controls"
        >
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
            <span className="text-blue-600 font-bold text-base">M</span>
          </div>
        </button>
      )}

      {!isReadingMode && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h2>            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleReadingMode}
                className="btn-secondary"
              >
                Reading Mode
              </button>
              <button
                onClick={() => setShowSource(!showSource)}
                className="btn-secondary"
              >
                {showSource ? 'View Rendered' : 'View Source'}
              </button>
              {tableOfContents.length > 0 && (
                <button
                  onClick={() => setShowTOC(!showTOC)}
                  className="btn-secondary"
                >
                  TOC
                </button>
              )}
              <button
                onClick={handleToggleFavorite}
                className={`btn-secondary ${isFavorite ? 'text-yellow-600 dark:text-yellow-400' : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
              <button
                onClick={handleShowQR}
                className="btn-secondary"
                title="Share via QR Code"
              >
                QR
              </button>
              <button
                onClick={handleCopyLink}
                className="btn-secondary"
              >
                Copy Link
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}      <div className={`flex-1 overflow-auto ${isReadingMode ? 'px-6 py-12 md:px-12 lg:px-16' : ''}`}>
        {showSource && !isReadingMode ? (
          <div className="p-6">
            <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-auto text-sm font-mono whitespace-pre-wrap">
              {originalMarkdown}
            </pre>
          </div>
        ) : (
          <div className={isReadingMode ? 'max-w-4xl mx-auto' : 'p-6'}>
            <div 
              className="markdown-body max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />          </div>
        )}
      </div>

      {/* Table of Contents */}
      {!isReadingMode && (
        <TableOfContents 
          items={tableOfContents}
          isOpen={showTOC}
          onToggle={() => setShowTOC(!showTOC)}
        />
      )}

      {/* QR Code Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={window.location.href}
        title={title}
      />
    </div>
  );
};
