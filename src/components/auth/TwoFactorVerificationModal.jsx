// src/components/auth/TwoFactorVerificationModal.jsx - LOGIN VERIFICATION
import React, { useState, useEffect } from 'react';
import { X, Shield, Key, AlertCircle } from 'lucide-react';

const TwoFactorVerificationModal = ({ isOpen, onClose, onVerify, userName, isLoading = false }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setVerificationCode('');
      setUseBackupCode(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (verificationCode.length < 6) {
      setError('Please enter a valid code');
      return;
    }

    onVerify({
      code: verificationCode,
      isBackupCode: useBackupCode
    });
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setVerificationCode(useBackupCode ? value.slice(0, 8) : value.slice(0, 6));
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-md w-full border border-white/20 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
              <p className="text-gray-300 text-sm">Verify your identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <Key className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Welcome back, {userName}!</h3>
            <p className="text-gray-300">
              {useBackupCode 
                ? 'Enter one of your backup codes to continue'
                : 'Enter the 6-digit code from your authenticator app'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                {useBackupCode ? 'Backup Code' : 'Verification Code'}
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder={useBackupCode ? "00000000" : "000000"}
                className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white text-center text-2xl font-mono tracking-widest placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-blue-400 focus:bg-white/10"
                maxLength={useBackupCode ? 8 : 6}
                autoFocus
                disabled={isLoading}
              />
              {!useBackupCode && (
                <p className="text-gray-400 text-xs mt-2 text-center">
                  Check your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || verificationCode.length < (useBackupCode ? 8 : 6)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify & Continue'
              )}
            </button>

            {/* Toggle between regular code and backup code */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setVerificationCode('');
                  setError('');
                }}
                className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors duration-200"
                disabled={isLoading}
              >
                {useBackupCode 
                  ? 'Use authenticator app instead'
                  : "Can't access your phone? Use backup code"
                }
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-200 text-sm text-center">
                <strong>Security Note:</strong> This code expires in 30 seconds. 
                If it doesn't work, wait for a new one to generate.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerificationModal;