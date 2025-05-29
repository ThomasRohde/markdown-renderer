import React, { useEffect, useState } from 'react';
import { useEncoding } from '../hooks/useEncoding';
import { useMarkdown } from '../hooks/useMarkdown';

export const Viewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [originalMarkdown, setOriginalMarkdown] = useState('');
  
  const { decode, getFromUrl } = useEncoding();
  const { renderedHtml, title, render } = useMarkdown();

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleEdit = () => {
    // Navigate to editor with content
    const baseUrl = window.location.origin + window.location.pathname;
    window.location.href = baseUrl;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-github-blue mx-auto mb-4"></div>
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
            className="px-4 py-2 bg-github-blue text-white rounded-md hover:bg-blue-700"
          >
            Create New Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSource(!showSource)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {showSource ? 'View Rendered' : 'View Source'}
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Copy Link
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-github-blue text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {showSource ? (
          <div className="p-6">
            <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-auto text-sm font-mono whitespace-pre-wrap">
              {originalMarkdown}
            </pre>
          </div>
        ) : (
          <div className="p-6">
            <div 
              className="markdown-body max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
