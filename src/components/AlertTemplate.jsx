'use client';
import { useState, useEffect } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

export default function AlertTemplate({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title = '', 
  message = '', 
  autoClose = true, 
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: MdCheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          buttonColor: 'text-green-500 hover:text-green-700'
        };
      case 'error':
        return {
          icon: MdError,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          buttonColor: 'text-red-500 hover:text-red-700'
        };
      case 'warning':
        return {
          icon: MdWarning,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          buttonColor: 'text-yellow-500 hover:text-yellow-700'
        };
      case 'info':
      default:
        return {
          icon: MdInfo,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          buttonColor: 'text-blue-500 hover:text-blue-700'
        };
    }
  };

  if (!isOpen) return null;

  const config = getAlertConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 bg-opacity-25 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Alert */}
      <div 
        className={`
          relative max-w-md w-full mx-auto rounded-xl border shadow-lg
          ${config.bgColor} ${config.borderColor}
          transform transition-all duration-300 ease-out
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
        `}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <div className="ml-3 w-0 flex-1">
              {title && (
                <h3 className={`text-sm font-medium ${config.titleColor} mb-1`}>
                  {title}
                </h3>
              )}
              <p className={`text-sm ${config.messageColor}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex ${config.buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1 transition-colors duration-200`}
                onClick={handleClose}
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}