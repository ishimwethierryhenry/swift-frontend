// src/components/auth/TwoFactorSetupModal.jsx - PROPERLY INTEGRATED WITH YOUR BACKEND
import React, { useState, useEffect } from 'react';
import { X, Shield, Smartphone, Key, Check, Copy, AlertCircle } from 'lucide-react';

const TwoFactorSetupModal = ({ isOpen, onClose, onComplete, userName, userEmail }) => {
  const [setupStep, setSetupStep] = useState(1); // 1: Intro, 2: QR Code, 3: Verify, 4: Complete
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCode, setCopiedBackupCode] = useState(null);

  // API base URL - point to your backend server
  const API_BASE_URL = 'https://swift-backend-88o8.onrender.com';

  // Generate QR Code and Secret when modal opens
  useEffect(() => {
    if (isOpen && setupStep === 2) {
      generateQRCode();
    }
  }, [isOpen, setupStep]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Call YOUR ACTUAL backend API endpoint
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Setup response status:', response.status);
      console.log('Setup response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Setup result:', result);
        
        if (result.status === 'success') {
          setQrCode(result.data.qrCode);
          setSecret(result.data.secret);
        } else {
          throw new Error(result.message || 'Failed to generate 2FA setup');
        }
      } else {
        let errorMessage = 'Failed to generate 2FA setup';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Backend 2FA generation failed:', err);
      setError(`Failed to generate 2FA setup: ${err.message}`);
    }
    
    setIsLoading(false);
  };

  const verifyTOTP = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call YOUR ACTUAL backend verification endpoint
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token: verificationCode
        })
      });

      console.log('Enable response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Enable result:', result);
        
        if (result.status === 'success') {
          setBackupCodes(result.data.backupCodes || []);
          setSetupStep(4);
          
          // Save 2FA status
          localStorage.setItem(`2fa_enabled_${userName}`, 'true');
          localStorage.setItem(`2fa_secret_${userName}`, secret);
        } else {
          throw new Error(result.message || 'Invalid verification code');
        }
      } else {
        let errorMessage = 'Invalid verification code';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Backend verification failed:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    }

    setIsLoading(false);
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackupCode(text);
        setTimeout(() => setCopiedBackupCode(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleComplete = () => {
    // Save backup codes
    localStorage.setItem(`2fa_backup_codes_${userName}`, JSON.stringify(backupCodes));
    onComplete();
    onClose();
  };

  const resetModal = () => {
    setSetupStep(1);
    setQrCode('');
    setSecret('');
    setVerificationCode('');
    setBackupCodes([]);
    setError('');
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-lg w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Setup Two-Factor Authentication</h2>
              <p className="text-gray-300 text-sm">Step {setupStep} of 4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Introduction */}
          {setupStep === 1 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Secure Your Account</h3>
                <p className="text-gray-300 text-lg">
                  Two-factor authentication adds an extra layer of security to your account.
                </p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-200">Enhanced account security</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-200">Protection against unauthorized access</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-200">Works with Google Authenticator, Authy, and more</span>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-200 text-sm">
                  <strong>What you'll need:</strong> A smartphone with an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
                </p>
              </div>

              <button
                onClick={() => setSetupStep(2)}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Step 2: QR Code */}
          {setupStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Smartphone className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Scan QR Code</h3>
                <p className="text-gray-300">
                  Open your authenticator app and scan this QR code to add your account.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                  <button
                    onClick={generateQRCode}
                    className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all duration-200"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* QR Code Display */}
                  <div className="bg-white p-6 rounded-2xl flex justify-center">
                    {qrCode ? (
                      <img 
                        src={qrCode} 
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                        <span className="text-gray-500">Loading QR Code...</span>
                      </div>
                    )}
                  </div>

                  {/* Manual Entry Option */}
                  {secret && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h4 className="text-white font-medium mb-2">Can't scan? Enter manually:</h4>
                      <div className="flex items-center space-x-2">
                        <code className="bg-black/30 text-green-300 px-3 py-2 rounded-lg text-sm font-mono flex-1 break-all">
                          {secret}
                        </code>
                        <button
                          onClick={() => copyToClipboard(secret, 'secret')}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          title="Copy secret"
                        >
                          {copiedSecret ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setSetupStep(1)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 border border-white/20"
                >
                  Back
                </button>
                <button
                  onClick={() => setSetupStep(3)}
                  disabled={isLoading || !qrCode || error}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {setupStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Key className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Verify Setup</h3>
                <p className="text-gray-300">
                  Enter the 6-digit code from your authenticator app to verify the setup.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    placeholder="000000"
                    className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white text-center text-2xl font-mono tracking-widest placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-green-400 focus:bg-white/10"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-gray-400 text-xs mt-2">
                    Enter the current 6-digit code from your authenticator app
                  </p>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSetupStep(2)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 border border-white/20"
                >
                  Back
                </button>
                <button
                  onClick={verifyTOTP}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 relative"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete with Backup Codes */}
          {setupStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Setup Complete!</h3>
                <p className="text-gray-300">
                  Two-factor authentication is now enabled for your account.
                </p>
              </div>

              {backupCodes.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <h4 className="text-yellow-300 font-semibold mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Important: Save Your Backup Codes
                  </h4>
                  <p className="text-yellow-200 text-sm mb-4">
                    Store these backup codes in a safe place. You can use them to access your account if you lose your phone.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-black/30 rounded-lg p-2">
                        <code className="text-green-300 font-mono text-sm flex-1">{code}</code>
                        <button
                          onClick={() => copyToClipboard(code, 'backup')}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Copy code"
                        >
                          {copiedBackupCode === code ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                    className="w-full bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-yellow-500/30"
                  >
                    Copy All Backup Codes
                  </button>
                </div>
              )}

              <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                Complete Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetupModal;