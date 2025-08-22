// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import logo2 from "../assets/logo2.png";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import { 
  verifyResetToken, 
  resetPassword, 
  clearPasswordState 
} from "../redux/slices/passwordSlice";
import { validateResetPassword } from "../validation/passwordSchema";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    tokenValid, 
    tokenLoading, 
    tokenError, 
    userInfo, 
    resetLoading, 
    resetSuccess, 
    resetError 
  } = useSelector((state) => state.password);

  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  
  // NEW: Password visibility state
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    setIsVisible(true);
    dispatch(clearPasswordState());
    
    if (token) {
      dispatch(verifyResetToken(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (resetSuccess) {
      toast.success("Password reset successfully! You can now login with your new password.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [resetSuccess, navigate]);

  useEffect(() => {
    if (resetError) {
      toast.error(resetError);
    }
  }, [resetError]);

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

  // NEW: Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form using new validation function
    const validation = validateResetPassword(token, formData.newPassword, formData.confirmPassword);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Dispatch password reset
    dispatch(resetPassword({
      token,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    }));
  };

  // Loading state
  if (tokenLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenError || !tokenValid) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative group mr-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-pink-400 to-red-500 rounded-2xl opacity-75 blur"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                <img
                  src={logo2}
                  alt="SWIFT Logo"
                  className="w-12 h-12 object-cover rounded-xl"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-300 via-pink-200 to-red-300 bg-clip-text text-transparent">
              SWIFT
            </h1>
          </div>

          {/* Error Card */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-red-500/30 shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
            <p className="text-gray-300 mb-6">
              This password reset link is invalid or has expired. Reset links are only valid for 5 minutes for security reasons.
            </p>

            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/login"
                className="block w-full bg-transparent border-2 border-gray-500 hover:bg-gray-500 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative group mr-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-2xl opacity-75 blur"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                <img
                  src={logo2}
                  alt="SWIFT Logo"
                  className="w-12 h-12 object-cover rounded-xl"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 via-emerald-200 to-green-300 bg-clip-text text-transparent">
              SWIFT
            </h1>
          </div>

          {/* Success Card */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-green-500/30 shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Password Reset Complete!</h2>
            <p className="text-gray-300 mb-6">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>

            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main reset form
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full items-center justify-center p-8 relative z-10">
        <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

          {/* Logo Section */}
          <div className={`flex items-center justify-center mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            <div className="relative group mr-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300 group-hover:scale-110"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-300 shadow-2xl">
                <img
                  src={logo2}
                  alt="SWIFT Logo"
                  className="w-12 h-12 object-cover rounded-xl"
                />
                <div className="absolute inset-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 rounded-xl"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent">
              SWIFT
            </h1>
          </div>

          {/* Header Text */}
          <div className={`text-center mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
            <h2 className="text-3xl font-bold text-white mb-2">Reset Your Password</h2>
            <p className="text-gray-300 text-lg">
              Hi {userInfo?.fname || 'there'}! Create a new secure password for your account.
            </p>
          </div>

          {/* Reset Form */}
          <form
            onSubmit={handleSubmit}
            className={`backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className="space-y-6">

              {/* New Password Field */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-white font-medium text-sm uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 pr-12 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                      focusedField === 'newPassword'
                        ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25'
                        : errors.newPassword
                        ? 'border-red-400'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    placeholder="Enter your new password"
                    disabled={resetLoading}
                  />
                  
                  {/* Eye Icon Button */}
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
                    disabled={resetLoading}
                  >
                    {showPassword.newPassword ? (
                      // Eye Slash (Hide) Icon
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      // Eye (Show) Icon
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
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
                <div className="relative">
                  <input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 pr-12 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                      focusedField === 'confirmPassword'
                        ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25'
                        : errors.confirmPassword
                        ? 'border-red-400'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    placeholder="Confirm your new password"
                    disabled={resetLoading}
                  />
                  
                  {/* Eye Icon Button */}
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
                    disabled={resetLoading}
                  >
                    {showPassword.confirmPassword ? (
                      // Eye Slash (Hide) Icon
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      // Eye (Show) Icon
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {errors.confirmPassword && (
                  <span className="text-red-400 text-sm animate-pulse">{errors.confirmPassword}</span>
                )}

                {/* Password Match Indicator */}
                {formData.newPassword && formData.confirmPassword && (
                  <div className={`flex items-center mt-2 text-sm transition-colors duration-300 ${
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

              {/* Reset Button */}
              <button
                type="submit"
                disabled={resetLoading || formData.newPassword !== formData.confirmPassword || !formData.newPassword}
                className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className={`relative z-10 transition-all duration-300 ${resetLoading ? 'opacity-0' : 'opacity-100'}`}>
                  Reset Password
                </span>

                {/* Loading Spinner */}
                {resetLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Button Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-2">
              <Link 
                to="/login" 
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 block"
              >
                Remember your password? Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-300 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.6;
          }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}