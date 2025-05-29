import React, { useEffect, useState } from 'react';
import { generateQRCode } from '../utils/qrcode';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, url, title = 'Share Document' }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const generateQR = async () => {
    setIsLoading(true);
    setError('');
    try {
      const qrDataUrl = await generateQRCode(url);
      setQrCode(qrDataUrl);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR code generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && url) {
      generateQR();
    }
  }, [isOpen, url]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        console.error('Native share failed:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 p-4">
              {error}
            </div>
          )}

          {qrCode && !isLoading && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="border border-gray-200 dark:border-gray-600 rounded"
                />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan with your phone camera to view this document
              </p>              <div className="space-y-2">
                <button
                  onClick={handleCopyUrl}
                  className="btn-primary w-full"
                >
                  Copy Link
                </button>

                {'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="btn-secondary w-full"
                  >
                    Share via Device
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                  {url}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
