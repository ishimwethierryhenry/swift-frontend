// src/pages/Signup.jsx - UPDATED VERSION WITH FORGOT PASSWORD LINK
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import banner_IMG from "../assets/banner.jpeg";
import logo2 from "../assets/logo2.png";
import { signup, clearSignupState } from "../redux/slices/signupSlice";
import { signupSchema } from "../validation/signupSchema";

export default function Signup() {
  const dispatch = useDispatch();
  const signupHandler = useSelector((state) => state.signup);
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [signupData, setSignupData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    location: "",
    gender: "",
    role: "guest", // Default to guest role
  });

  useEffect(() => {
    setIsVisible(true);
    // Clear any previous signup state when component mounts
    dispatch(clearSignupState());
  }, [dispatch]);

  useEffect(() => {
    if (signupHandler?.success && signupHandler?.serverResponded) {
      toast.success("Account created successfully! Please login to continue.");
      // Redirect to login page after successful signup
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
    
    if (signupHandler?.error && signupHandler?.serverResponded) {
      toast.error(signupHandler.error);
    }
  }, [signupHandler?.success, signupHandler?.error, signupHandler?.serverResponded, navigate]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setSignupData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = (data) => {
    const { error } = signupSchema.validate(data, { abortEarly: false });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm(signupData)) {
      dispatch(signup(signupData));
    } else {
      toast.error("Please fix the form errors before submitting.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Left Side - Signup Form */}
      <div className="flex flex-col w-full lg:w-1/2 items-center justify-center p-4 sm:p-8 relative z-10 overflow-y-auto">
        <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

          {/* Logo Section */}
          <div className={`flex items-center justify-center mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
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
          <div className={`text-center mb-6 transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-300 text-lg">Join SWIFT Pool Management System</p>
          </div>

          {/* Signup Form */}
          <form
            onSubmit={handleSubmit}
            className={`backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className="space-y-4">

              {/* First Name and Last Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="fname" className="block text-white font-medium text-sm uppercase tracking-wide">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="fname"
                    value={signupData.fname}
                    onChange={handleInput}
                    onFocus={() => setFocusedField('fname')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                      focusedField === 'fname'
                        ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                        : errors.fname
                        ? 'border-red-400'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.fname && (
                    <span className="text-red-400 text-sm animate-pulse">{errors.fname}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lname" className="block text-white font-medium text-sm uppercase tracking-wide">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lname"
                    value={signupData.lname}
                    onChange={handleInput}
                    onFocus={() => setFocusedField('lname')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                      focusedField === 'lname'
                        ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                        : errors.lname
                        ? 'border-red-400'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lname && (
                    <span className="text-red-400 text-sm animate-pulse">{errors.lname}</span>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-white font-medium text-sm uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleInput}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                    focusedField === 'email'
                      ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                      : errors.email
                      ? 'border-red-400'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className="text-red-400 text-sm animate-pulse">{errors.email}</span>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-white font-medium text-sm uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={signupData.phone}
                  onChange={handleInput}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                    focusedField === 'phone'
                      ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                      : errors.phone
                      ? 'border-red-400'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <span className="text-red-400 text-sm animate-pulse">{errors.phone}</span>
                )}
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <label htmlFor="location" className="block text-white font-medium text-sm uppercase tracking-wide">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={signupData.location}
                  onChange={handleInput}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
                    focusedField === 'location'
                      ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                      : errors.location
                      ? 'border-red-400'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  placeholder="Enter your location"
                />
                {errors.location && (
                  <span className="text-red-400 text-sm animate-pulse">{errors.location}</span>
                )}
              </div>

              {/* Gender and Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-white font-medium text-sm uppercase tracking-wide">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={signupData.gender}
                    onChange={handleInput}
                    onFocus={() => setFocusedField('gender')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white transition-all duration-300 focus:outline-none ${
                      focusedField === 'gender'
                        ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                        : errors.gender
                        ? 'border-red-400'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <option value="" className="bg-slate-800 text-white">Select Gender</option>
                    <option value="Male" className="bg-slate-800 text-white">Male</option>
                    <option value="Female" className="bg-slate-800 text-white">Female</option>
                    <option value="Other" className="bg-slate-800 text-white">Other</option>
                  </select>
                  {errors.gender && (
                    <span className="text-red-400 text-sm animate-pulse">{errors.gender}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="block text-white font-medium text-sm uppercase tracking-wide">
                    Role
                  </label>
                  <select
                    name="role"
                    value={signupData.role}
                    onChange={handleInput}
                    onFocus={() => setFocusedField('role')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white transition-all duration-300 focus:outline-none ${
                      focusedField === 'role'
                        ? 'border-cyan-400 bg-white/10 shadow-lg shadow-cyan-400/25 scale-105'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <option value="guest" className="bg-slate-800 text-white">Guest</option>
                    <option value="operator" className="bg-slate-800 text-white">Operator</option>
                    <option value="overseer" className="bg-slate-800 text-white">Overseer</option>
                  </select>
                </div>
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                disabled={signupHandler.loading}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className={`relative z-10 transition-all duration-300 ${signupHandler.loading ? 'opacity-0' : 'opacity-100'}`}>
                  Create Account
                </span>

                {/* Loading Spinner */}
                {signupHandler.loading && (
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
                Already have an account? Sign In
              </Link>
              <Link 
                to="/forgot-password" 
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 block flex items-center justify-center group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.243-6.243C13.067 10.5 14.147 10 15.257 10a6 6 0 016 6z" />
                </svg>
                Forgot your password?
              </Link>
              <Link 
                to="/" 
                className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 block"
              >
                Return to Landing Page
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Banner Image */}
      <div className={`hidden lg:flex w-1/2 transition-all duration-1000 delay-800 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
        <div className="relative w-full h-screen">
          <img
            src="https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="Happy people enjoying swimming pool together"
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
  );
}