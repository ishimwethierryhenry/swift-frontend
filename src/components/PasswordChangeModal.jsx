// src/components/PasswordChangeModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { forcePasswordChange, clearPasswordErrors } from "../redux/slices/passwordSlice";
import { forcePasswordChangeSchema } from "../validation/passwordSchema";

const PasswordChangeModal = ({ isOpen, onClose, isFirstLogin = false }) => {
  const dispatch = useDispatch();
  const { forceChangeLoading, forceChangeSuccess, forceChangeError } = useSelector(
    (state) => state.password
  );

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (forceChangeSuccess) {
      toast.success("Password changed successfully! Welcome to SWIFT!");
      onClose();
    }
  }, [forceChangeSuccess, onClose]);

  useEffect(() => {
    if (forceChangeError) {
      toast.error(forceChangeError);
    }
  }, [forceChangeError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    dispatch(clearPasswordErrors());

    // Validate form
    const { error } = forcePasswordChangeSchema.validate(formData);
    if (error) {
      const newErrors = {};
      error.details.forEach((detail) => {
        newErrors[detail.path[0]] = detail.message;
      });
      setErrors(newErrors);
      return;
    }

    // Dispatch password change
    dispatch(forcePasswordChange(formData));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true"></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-white/20">
          
          {/* Header */}
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white text-center" id="modal-title">
              {isFirstLogin ? "Set Your Password" : "Password Change Required"}
            </h3>
            <p className="mt-2 text-center text-gray-300">
              {isFirstLogin 
                ? "Welcome to SWIFT! Please set a secure password to continue."
                : "For security reasons, you must change your password before proceeding."
              }
            </p>
          </div>

          {/* Security Notice */}
          {isFirstLogin && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-amber-200 font-medium text-sm">Security Notice</h4>
                  <p className="text-amber-200 text-sm mt-1">
                    Your account currently uses a default password. Please create a strong, unique password to secure your account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-white font-medium text-sm uppercase tracking-wide">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('newPassword')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                  focusedField === 'newPassword'
                    ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25'
                    : errors.newPassword
                    ? 'border-red-400'
                    : 'border-white/20 hover:border-white/40'
                }`}
                placeholder="Enter your new password"
                disabled={forceChangeLoading}
                required
              />
              {errors.newPassword && (
                <span className="text-red-400 text-sm animate-pulse">{errors.newPassword}</span>
              )}

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={formData.newPassword} showDetails={true} />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-white font-medium text-sm uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                  focusedField === 'confirmPassword'
                    ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25'
                    : errors.confirmPassword
                    ? 'border-red-400'
                    : 'border-white/20 hover:border-white/40'
                }`}
                placeholder="Confirm your new password"
                disabled={forceChangeLoading}
                required
              />
              {errors.confirmPassword && (
                <span className="text-red-400 text-sm animate-pulse">{errors.confirmPassword}</span>
              )}

              {/* Password Match Indicator */}
              {formData.newPassword && formData.confirmPassword && (
                <div className={`flex items-center mt-2 text-sm ${
                  formData.newPassword === formData.confirmPassword 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Passwords match
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Passwords don't match
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={forceChangeLoading || formData.newPassword !== formData.confirmPassword || !formData.newPassword}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className={`relative z-10 transition-all duration-300 ${forceChangeLoading ? 'opacity-0' : 'opacity-100'}`}>
                  {isFirstLogin ? "Set Password" : "Change Password"}
                </span>

                {/* Loading Spinner */}
                {forceChangeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Button Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {!isFirstLogin && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={forceChangeLoading}
                  className="flex-1 bg-transparent border-2 border-gray-500 hover:bg-gray-500 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <h4 className="text-blue-200 font-medium text-sm mb-2">💡 Password Security Tips</h4>
            <ul className="text-blue-200 text-xs space-y-1">
              <li>• Use at least 8 characters with mixed case, numbers, and symbols</li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Consider enabling two-factor authentication for extra security</li>
              <li>• Store your password securely in a password manager</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;