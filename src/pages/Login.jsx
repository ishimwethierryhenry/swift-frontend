// src/pages/Login.jsx - UPDATED WITH 2FA VERIFICATION FLOW
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import banner_IMG from "../assets/banner.jpeg";
import logo2 from "../assets/logo2.png";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../redux/slices/loginSlice";
import { loginSchema } from "../validation/loginSchema";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import modals
import TwoFactorSetupModal from "../components/auth/TwoFactorSetupModal";
import TwoFactorVerificationModal from "../components/auth/TwoFactorVerificationModal";
import { variables } from "../data/constants";
import { toast } from "react-toastify";

const SERVER_URL = variables.SERVER_URL;

// 2FA Prompt Modal Component (for first-time setup)
const TwoFactorPromptModal = ({ isOpen, onClose, onEnable, onSkip, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl transform animate-pulse">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Welcome, {userName}!</h3>
          <p className="text-gray-300">Secure your account with Two-Factor Authentication</p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-200 text-sm">Enhanced account security</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-200 text-sm">Protection against unauthorized access</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-200 text-sm">Quick setup with your mobile device</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onEnable}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Enable 2FA Now
          </button>
          
          <button
            onClick={onSkip}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/40"
          >
            Maybe Later
          </button>
        </div>

        {/* Note */}
        <p className="text-gray-400 text-xs text-center mt-4">
          You can always enable 2FA later from your account settings
        </p>
      </div>
    </div>
  );
};

export default function Login() {
  const dispatch = useDispatch();
  const authHandler = useSelector((state) => state.login);
  const navigation = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // 🆕 UPDATED: 2FA Modal States
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FAVerification, setShow2FAVerification] = useState(false); // 🆕 NEW
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // 🆕 Store user data temporarily

  const [errors, setErrors] = useState({});
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [verificationLoading, setVerificationLoading] = useState(false); // 🆕 NEW

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
  if (authHandler?.serverResponded && authHandler?.response) {
    const response = authHandler.response;
    
    // 🆕 Check if 2FA verification is required
    if (response.requires2FA) {
      console.log('🔒 2FA verification required');
      setPendingUser(response.user);
      setShow2FAVerification(true);
      return;
    }

    // Handle normal login flow (without 2FA)
    // 🔥 IMPORTANT: Store user data in localStorage for non-2FA users
    if (response.user && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user_name', response.user.fname);
      localStorage.setItem('user_email', response.user.email);
      localStorage.setItem('user_role', response.user.role);
      localStorage.setItem('user_id', response.user.id.toString());
      localStorage.setItem('user_location', response.user.location || '');
    }

    const userRole = localStorage.getItem("user_role");
    const userName = localStorage.getItem("user_name");
    const hasShown2FAPrompt = localStorage.getItem(`2fa_prompt_shown_${userName}`);
    
    // Check if this is first time login (setup prompt)
    if (!hasShown2FAPrompt && userRole !== "guest" && response.user && !response.user.twoFactorEnabled) {
      setIsFirstTimeLogin(true);
      setShow2FAPrompt(true);
    } else {
      redirectToDashboard(userRole);
    }
  }
}, [authHandler?.serverResponded, authHandler?.response, navigation]);

  const redirectToDashboard = (userRole) => {
    if (userRole === "guest") {
      navigation("/guest-dashboard");
    } else {
      navigation("/dashboard");
    }
  };

  // 🆕 NEW: Handle 2FA Verification during login - FIXED VERSION
  const handle2FAVerification = async ({ code, isBackupCode }) => {
    setVerificationLoading(true);
    
    try {
      console.log('🔐 Sending 2FA verification request:', {
        code: code.substring(0, 2) + '***', // Log partial code for debugging
        isBackupCode,
        userId: pendingUser?.id
      });
  
      const response = await axios.post(`${SERVER_URL}/2fa/verify-login`, {
        code,
        isBackupCode,
        userId: pendingUser?.id
      });
  
      console.log('✅ 2FA verification response:', response.data);
  
      if (response.data.status === 'success') {
        toast.success('2FA verification successful!');
        
        // 🔥 IMPORTANT: Save the token and user info from successful 2FA verification
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('authToken', response.data.token);
          console.log('💾 Token saved to localStorage');
        }
        
        if (response.data.user) {
          const user = response.data.user;
          localStorage.setItem('user_name', user.fname);
          localStorage.setItem('user_email', user.email);
          localStorage.setItem('user_role', user.role);
          localStorage.setItem('user_id', user.id.toString());
          localStorage.setItem('user_location', user.location || '');
          
          // Mark 2FA as enabled for this user
          localStorage.setItem(`2fa_enabled_${user.fname}`, 'true');
          
          console.log('👤 User info saved to localStorage:', {
            name: user.fname,
            email: user.email,
            role: user.role
          });
        }
        
        // Close verification modal
        setShow2FAVerification(false);
        setPendingUser(null);
        
        // Check if user needs to change password first
        if (response.data.redirectTo === '/change-password' || response.data.user?.requiresPasswordChange || response.data.user?.isFirstLogin) {
          console.log('🔄 Redirecting to change password');
          navigation('/change-password');
          return;
        }
        
        // Redirect to dashboard
        const userRole = response.data.user?.role || localStorage.getItem("user_role");
        console.log('🏠 Redirecting to dashboard for role:', userRole);
        redirectToDashboard(userRole);
        
      } else {
        throw new Error(response.data.message || '2FA verification failed');
      }
      
    } catch (error) {
      console.error('❌ 2FA verification failed:', error);
      
      let errorMessage = '2FA verification failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show more specific error messages
      if (errorMessage.includes('Invalid backup code')) {
        toast.error('Invalid backup code. Please check and try again.');
      } else if (errorMessage.includes('Invalid verification code')) {
        toast.error('Invalid verification code. Please check your authenticator app.');
      } else {
        toast.error(errorMessage);
      }
      
    } finally {
      setVerificationLoading(false);
    }
  };

  // Handle 2FA Enable - Opens Setup Modal
  const handle2FAEnable = () => {
    const userName = localStorage.getItem("user_name");
    
    // Mark that 2FA prompt has been shown
    localStorage.setItem(`2fa_prompt_shown_${userName}`, "true");
    
    // Close the prompt modal and open the setup modal
    setShow2FAPrompt(false);
    setShow2FASetup(true);
  };

  // Handle 2FA Setup Completion
  const handle2FASetupComplete = () => {
    const userName = localStorage.getItem("user_name");
    
    // Set 2FA preference as enabled
    localStorage.setItem(`2fa_enabled_${userName}`, "true");
    
    setShow2FASetup(false);
    
    // Redirect to dashboard
    const userRole = localStorage.getItem("user_role");
    redirectToDashboard(userRole);
  };

  const handle2FASkip = () => {
    const userName = localStorage.getItem("user_name");
    
    // Mark that 2FA prompt has been shown
    localStorage.setItem(`2fa_prompt_shown_${userName}`, "true");
    
    // Set 2FA preference as disabled
    localStorage.setItem(`2fa_enabled_${userName}`, "false");
    
    setShow2FAPrompt(false);
    
    // Redirect to dashboard
    const userRole = localStorage.getItem("user_role");
    redirectToDashboard(userRole);
  };

  const handleInput = (e) => {
    e.preventDefault();
    setLoginData((prevState) => ({
      ...prevState,
      email: e.target.name === "email" ? e.target.value : prevState.email,
      password: e.target.name === "pwd" ? e.target.value : prevState.password,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      const formData = {
        email: String(loginData.email),
        pwd: String(loginData.password),
      };

      if (validateForm({ email: formData.email, password: loginData.password })) {
        dispatch(auth(formData));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const validateForm = (data) => {
    const { error } = loginSchema.validate(data, { abortEarly: false });
    if (!error) {
      setErrors({});
      return true;
    }

    const newErrors = {};
    error.details.forEach((detail) => {
      newErrors[detail.path[0]] = detail.message;
    });
    setErrors(newErrors);
    return false;
  };

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Left Side - Login Form */}
        <div className="flex flex-col w-full lg:w-1/2 items-center justify-center p-8 relative z-10">
          <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

            {/* Logo Section with Custom Logo */}
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

            {/* Welcome Text */}
            <div className={`text-center mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
              <p className="text-gray-300 text-lg">Sign in to your pool monitoring dashboard</p>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <strong>Guest Access:</strong> Create a Guest account or Use email: guest@gmail.com, password: 12345678
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              className={`backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              <div className="space-y-6">

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-white font-medium text-sm uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      onChange={handleInput}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                        focusedField === 'email'
                          ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      placeholder="Enter your email"
                    />
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 opacity-0 transition-opacity duration-300 pointer-events-none ${
                      focusedField === 'email' ? 'opacity-100' : ''
                    }`}></div>
                  </div>
                  {errors.email && (
                    <span className="text-red-400 text-sm animate-pulse">{errors.email}</span>
                  )}
                </div>

                {/* Password Field with Eye Icon */}
                <div className="space-y-2">
                  <label htmlFor="pwd" className="block text-white font-medium text-sm uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="pwd"
                      onChange={handleInput}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 pr-12 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                        focusedField === 'password'
                          ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      placeholder="Enter your password"
                    />
                    
                    {/* Eye Icon Button */}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
                      disabled={authHandler.loading}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 opacity-0 transition-opacity duration-300 pointer-events-none ${
                      focusedField === 'password' ? 'opacity-100' : ''
                    }`}></div>
                  </div>
                  {errors.password && (
                    <span className="text-red-400 text-sm animate-pulse">{errors.password}</span>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-cyan-400 hover:text-cyan-300 transition duration-300 flex items-center group"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243C13.067 10.5 14.147 10 15.257 10a6 6 0 016 6z" />
                      </svg>
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={authHandler.loading}
                  className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className={`relative z-10 transition-all duration-300 ${authHandler.loading ? 'opacity-0' : 'opacity-100'}`}>
                    Sign In to Dashboard
                  </span>

                  {/* Loading Spinner */}
                  {authHandler.loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              {/* Additional Links */}
              <div className="mt-6 text-center space-y-2">
                <Link 
                  to="/signup" 
                  className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 block"
                >
                  Don't have an account? Sign Up
                </Link>
                <Link 
                  to="/" 
                  className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 block"
                >
                  Return to the Landing Page
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Banner Image */}
        <div className={`hidden lg:flex w-1/2 transition-all duration-1000 delay-800 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          <div className="relative w-full h-screen">
            <img
              src={banner_IMG}
              alt="Login Banner"
              className="object-cover object-center w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-900/10"></div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
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

      {/* 2FA Prompt Modal (for first-time users) */}
      <TwoFactorPromptModal
        isOpen={show2FAPrompt}
        onClose={() => setShow2FAPrompt(false)}
        onEnable={handle2FAEnable}
        onSkip={handle2FASkip}
        userName={localStorage.getItem("user_name") || "User"}
      />

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        onComplete={handle2FASetupComplete}
        userName={localStorage.getItem("user_name") || "User"}
        userEmail={loginData.email || localStorage.getItem("user_email")}
      />

      {/* 🆕 NEW: 2FA Verification Modal (for existing 2FA users) */}
      <TwoFactorVerificationModal
        isOpen={show2FAVerification}
        onClose={() => {
          setShow2FAVerification(false);
          setPendingUser(null);
        }}
        onVerify={handle2FAVerification}
        userName={pendingUser?.fname || localStorage.getItem("user_name") || "User"}
        isLoading={verificationLoading}
      />
    </>
  );
}