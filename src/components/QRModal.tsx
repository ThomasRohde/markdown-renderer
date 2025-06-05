import React, { useEffect, useState } from 'react';
import { X, Copy } from 'lucide-react';
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


  if (!isOpen) return null;
  return (    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 shadow-2xl" 
        style={{boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 10px -5px rgba(0, 0, 0, 0.04)'}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
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
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
