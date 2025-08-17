// =================== ERROR ALERT COMPONENT ===================
// src/components/ErrorAlert.jsx
import React from 'react';

export const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <div>
            <h4 className="text-red-300 font-semibold">Error</h4>
            <p className="text-red-200 text-sm">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-300 hover:text-red-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};