// 5. UPDATED Login.jsx
import React, { useEffect, useState } from "react";
import banner_IMG from "../assets/banner.jpeg";
import logo2 from "../assets/logo2.png";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../redux/slices/loginSlice";
import { loginSchema } from "../validation/loginSchema";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const authHandler = useSelector((state) => state.login);
  const navigation = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [errors, setErrors] = useState({});
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Navigate to dashboard when login is successful - Updated for guest access
  useEffect(() => {
    if (authHandler.serverResponded) {
      const userRole = localStorage.getItem("user_role");
      
      // All users go to the same dashboard, but guests will have restricted access
      navigation("/dashboard");
    }
  }, [authHandler.serverResponded, navigation]);

  const handleInput = (e) => {
    e.preventDefault();
    setLoginData((prevState) => ({
      ...prevState,
      email: e.target.name === "email" ? e.target.value : prevState.email,
      password: e.target.name === "pwd" ? e.target.value : prevState.password,
    }));
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
                {/* Overlay gradient for better contrast */}
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
                <strong>Guest Access:</strong> Use email: guest@gmail.com, password: 12345678
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

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="pwd" className="block text-white font-medium text-sm uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="pwd"
                    onChange={handleInput}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                      focusedField === 'password'
                        ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    placeholder="Enter your password"
                  />
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-blue-500/20 opacity-0 transition-opacity duration-300 pointer-events-none ${
                    focusedField === 'password' ? 'opacity-100' : ''
                  }`}></div>
                </div>
                {errors.password && (
                  <span className="text-red-400 text-sm animate-pulse">{errors.password}</span>
                )}
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

                {/* Button Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Additional Links */}
            <div className="mt-6 text-center">
              <a href="/" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300">
                Return to the Landing Page
              </a>
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
          {/* Optional subtle overlay for better visual integration */}
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
  );
}