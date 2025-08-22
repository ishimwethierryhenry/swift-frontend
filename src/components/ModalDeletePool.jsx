import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export const ModalDeletePool = ({ Fn, data, onConfirmDelete, loading }) => {
  const handleClose = () => {
    Fn((prevState) => ({ ...prevState, open: false, data: null }));
  };

  const handleConfirmDelete = () => {
    if (onConfirmDelete && data) {
      onConfirmDelete(data.id || data._id);
    }
  };

  // Prevent modal from closing when clicking inside the modal content
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="relative">
      {/* Backdrop with outside click functionality */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden backdrop-blur-sm"
        onClick={handleClose}
      >
        {/* Enhanced glassmorphism backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-blue-900/30 to-gray-900/40 backdrop-blur-md"></div>

        {/* Enhanced Glassmorphism Container */}
        <div 
          className="relative bg-gradient-to-br from-slate-800/60 via-blue-900/60 to-red-800/60 backdrop-blur-2xl rounded-2xl border border-red-400/30 shadow-2xl max-w-lg mx-4 overflow-hidden transform transition-all duration-300 scale-100 hover:scale-102"
          onClick={handleModalClick}
        >
          
          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-red-400/30 via-orange-400/20 to-pink-400/30 p-px animate-pulse">
            <div className="h-full w-full rounded-2xl bg-gradient-to-br from-slate-800/80 via-blue-900/80 to-red-800/80 backdrop-blur-2xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Delete Swimming Pool
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 backdrop-blur-sm">
                <p className="text-gray-200 text-sm leading-relaxed">
                  You are about to delete the pool named{' '}
                  <span className="font-semibold text-red-300 bg-red-500/20 px-2 py-1 rounded">
                    {data?.name}
                  </span>
                  . This action cannot be undone. Are you sure you want to proceed?
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-all duration-200 font-medium backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmDelete}
                  className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg transform hover:scale-105 disabled:hover:scale-100 ${
                    loading 
                      ? 'bg-red-500/50 border border-red-400/30 text-red-200 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-pink-500 border border-red-400/50 text-white hover:from-red-600 hover:to-pink-600'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        /* Enhanced glassmorphism effects */
        .backdrop-blur-2xl {
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        /* Enhanced focus states */
        button:focus {
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3), 0 0 25px rgba(239, 68, 68, 0.1);
          outline: none;
        }
        
        /* Smooth animations */
        * {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Hover scale animations */
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};