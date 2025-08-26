// Toast Component - Add this to your components folder
// src/components/Toast.jsx

import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'info', duration = 5000, onClose, details = null }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close timer
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: FiCheckCircle,
          bgColor: 'bg-gradient-to-r from-emerald-500/90 to-green-500/90',
          borderColor: 'border-emerald-400',
          iconColor: 'text-emerald-200'
        };
      case 'error':
        return {
          icon: FiXCircle,
          bgColor: 'bg-gradient-to-r from-red-500/90 to-rose-500/90',
          borderColor: 'border-red-400',
          iconColor: 'text-red-200'
        };
      case 'warning':
        return {
          icon: FiAlertCircle,
          bgColor: 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90',
          borderColor: 'border-amber-400',
          iconColor: 'text-amber-200'
        };
      default:
        return {
          icon: FiInfo,
          bgColor: 'bg-gradient-to-r from-blue-500/90 to-cyan-500/90',
          borderColor: 'border-blue-400',
          iconColor: 'text-blue-200'
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div 
      className={`fixed top-4 right-4 z-[9999] transform transition-all duration-300 ease-in-out ${
        isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`
        ${config.bgColor} ${config.borderColor}
        backdrop-blur-lg border-2 rounded-xl shadow-2xl
        p-4 max-w-sm min-w-[300px]
        relative overflow-hidden
      `}>
        {/* Background shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                        transform -skew-x-12 -translate-x-full animate-shimmer"></div>
        
        <div className="relative flex items-start gap-3">
          <div className={`${config.iconColor} mt-0.5 flex-shrink-0`}>
            <IconComponent size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm leading-tight">
              {message}
            </div>
            
            {details && (
              <div className="text-white/80 text-xs mt-1 leading-relaxed">
                {details}
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors duration-200 flex-shrink-0 p-1 hover:bg-white/10 rounded"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Hook - Custom hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000, details = null) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration, details };
    
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, details = null) => addToast(message, 'success', 4000, details);
  const showError = (message, details = null) => addToast(message, 'error', 6000, details);
  const showWarning = (message, details = null) => addToast(message, 'warning', 5000, details);
  const showInfo = (message, details = null) => addToast(message, 'info', 4000, details);

  return {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  };
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-[9999] p-4 pointer-events-none">
      <div className="flex flex-col gap-3">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto"
            style={{ 
              transform: `translateY(${index * 10}px)`,
              zIndex: 9999 - index 
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              details={toast.details}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Toast;