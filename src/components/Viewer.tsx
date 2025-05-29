import React, { useEffect, useState, useCallback } from 'react';
import { useEncoding } from '../hooks/useEncoding';
import { useMarkdown } from '../hooks/useMarkdown';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { QRModal } from './QRModal';
import { TableOfContents } from './TableOfContents';
import { PullToRefresh } from './PullToRefresh';

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
  const [showTOC, setShowTOC] = useState(false);  const [isFavorite, setIsFavorite] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  
  const { decode, getFromUrl } = useEncoding();
  const { renderedHtml, title, tableOfContents, render } = useMarkdown();

  // Handle document refresh for pull-to-refresh
  const handleRefresh = useCallback(async () => {
    try {
      const encoded = getFromUrl();
      if (encoded) {
        const result = await decode(encoded);
        if (result.success) {
          setOriginalMarkdown(result.content);
          render(result.content);
        }
      }
    } catch (error) {
      console.error('Failed to refresh document:', error);
    }
  }, [decode, getFromUrl, render]);
  
  // Initialize pull-to-refresh (mobile only)
  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    pullDownThreshold: 80,
    maxPullDownDistance: 120
  });
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
      setShowMobileActions(false);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShowQR = () => {
    setShowQRModal(true);
    setShowMobileActions(false);
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
    return (      
      <div className="flex-1 flex items-center justify-center">
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
          </h2>          
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>          
          <button
            onClick={() => window.location.href = window.location.origin + window.location.pathname}
            className="btn-primary"
          >
            Create New Document
          </button>
        </div>
      </div>
    );
  }  
    return (
    <div className={`flex-1 flex flex-col max-w-7xl mx-auto w-full ${isReadingMode ? 'reading-mode' : ''}`}>
      {/* Pull to refresh indicator */}
      <PullToRefresh 
        isPulling={isPulling}
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        pullDownThreshold={80}
      />      {/* Reading Mode Toggle Button - iOS style */}
      {isReadingMode && (
        <button
          onClick={onToggleReadingMode}
          className="fixed top-4 right-4 z-50 w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
          title="Exit reading mode"
          aria-label="Exit reading mode"
          style={{
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(0, 0, 0, 0.04)'
          }}
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}      {/* Mobile Action Button (only in non-reading mode) - iOS style */}
      {!isReadingMode && (
        <button
          onClick={() => setShowMobileActions(true)}
          className="fixed bottom-16 right-4 z-40 w-14 h-14 sm:hidden bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white"
          style={{boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25), 0 0 0 1px rgba(37, 99, 235, 0.1)'}}
          aria-label="Show actions"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      )}      {/* Mobile Actions Drawer - iOS-style */}
      {showMobileActions && (
        <div className="fixed inset-0 z-50 sm:hidden" aria-modal="true">
          <div 
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-md"
            onClick={() => setShowMobileActions(false)}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl p-4 pb-safe">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => {
                  setShowSource(!showSource);
                  setShowMobileActions(false);
                }}                className="mobile-quick-action"
              >
                <span className="text-xl mb-1.5">{showSource ? '📄' : '📝'}</span>
                <span className="text-xs font-medium">{showSource ? 'View Doc' : 'Source'}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowTOC(!showTOC); 
                  setShowMobileActions(false);
                }}                className={`mobile-quick-action ${tableOfContents.length === 0 ? 'opacity-50' : ''}`}
                disabled={tableOfContents.length === 0}
              >
                <span className="text-xl mb-1.5">📑</span>
                <span className="text-xs font-medium">Contents</span>
              </button>
              
              <button
                onClick={() => {
                  handleShowQR();
                  setShowMobileActions(false);
                }}                className="mobile-quick-action"
              >
                <span className="text-xl mb-1.5">📱</span>
                <span className="text-xs font-medium">Share</span>
              </button>
              
              <button
                onClick={handleToggleFavorite}                className={`mobile-quick-action ${isFavorite ? 'text-yellow-600 dark:text-yellow-400' : ''}`}
              >
                <span className="text-xl mb-1.5">{isFavorite ? '★' : '☆'}</span>
                <span className="text-xs font-medium">Favorite</span>
              </button>
            </div>
              <div className="mt-5 grid grid-cols-2 gap-4">              <button
                onClick={() => {
                  if (onToggleReadingMode) {
                    onToggleReadingMode();
                  }
                  setShowMobileActions(false);
                }}
                className="btn-secondary py-3 flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Reading Mode
              </button>
              <button
                onClick={() => {
                  handleEdit();
                  setShowMobileActions(false);
                }}
                className="btn-primary py-3 flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Document
              </button>
            </div>
              <button
              onClick={() => setShowMobileActions(false)}
              className="mt-5 w-full text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}      {!isReadingMode && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onToggleReadingMode}
                className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"
                title="Toggle reading mode"
              >
                <span className="hidden sm:inline">Reading Mode</span>
                <span className="sm:hidden">📖</span>
              </button>
              <button
                onClick={() => setShowSource(!showSource)}
                className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"
                title={showSource ? "View rendered markdown" : "View source"}
              >
                <span className="hidden sm:inline">{showSource ? 'View Rendered' : 'View Source'}</span>
                <span className="sm:hidden">{showSource ? '📄' : '📝'}</span>
              </button>
              {tableOfContents.length > 0 && (
                <button
                  onClick={() => setShowTOC(!showTOC)}
                  className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"
                  title="Table of Contents"
                >
                  <span className="hidden sm:inline">TOC</span>
                  <span className="sm:hidden">📑</span>
                </button>
              )}
              <button
                onClick={handleToggleFavorite}
                className={`btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 ${isFavorite ? 'text-yellow-600 dark:text-yellow-400' : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
              <div className="dropdown-wrapper relative">
                <button
                  onClick={handleShowQR}
                  className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"
                  title="Share via QR Code"
                >
                  <span className="hidden sm:inline">QR</span>
                  <span className="sm:hidden">📱</span>
                </button>
              </div>
              <button
                onClick={handleCopyLink}
                className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 hidden sm:inline-block"
                title="Copy link to clipboard"
              >
                Copy Link
              </button>
              <button
                onClick={handleCopyLink}
                className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 sm:hidden"
                title="Copy link to clipboard"
              >
                📋
              </button>
              <button
                onClick={handleEdit}
                className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}      
      
      <div className={`flex-1 overflow-auto ${isReadingMode ? 'px-4 py-8 sm:px-6 md:px-12 lg:px-16' : ''}`}>
        {showSource && !isReadingMode ? (
          <div className="p-3 sm:p-6">
            <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 overflow-auto text-xs sm:text-sm font-mono whitespace-pre-wrap">
              {originalMarkdown}
            </pre>
          </div>
        ) : (
          <div className={isReadingMode ? 'max-w-4xl mx-auto' : 'p-3 sm:p-6'}>
            <div 
              className="markdown-body max-w-none mobile-optimized"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
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
