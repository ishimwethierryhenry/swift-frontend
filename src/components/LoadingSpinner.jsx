// =================== LOADING SPINNER COMPONENT ===================
// src/components/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-400/30 rounded-full animate-spin"></div>
          <div className="w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-white text-lg mt-4">Loading water quality data...</p>
      </div>
    </div>
  );
};