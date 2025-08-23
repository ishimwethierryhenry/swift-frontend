// // src/pages/ForgotPassword.jsx - SIMPLIFIED VERSION TO FIX CONSOLE ERROR
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { toast } from "react-toastify";
// import logo2 from "../assets/logo2.png";

// export default function ForgotPassword() {
//   const [isVisible, setIsVisible] = useState(false);
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [emailSent, setEmailSent] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   // Simple email validation function
//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     try {
//       // Validate email
//       if (!email) {
//         setErrors({ email: "Email is required" });
//         setLoading(false);
//         return;
//       }

//       if (!validateEmail(email)) {
//         setErrors({ email: "Please enter a valid email address" });
//         setLoading(false);
//         return;
//       }

//       // Send request to backend
//       const response = await fetch(`${import.meta.env.VITE_APP_API_URL || "https://swift-backend-88o8.onrender.com"}/password/forgot`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setEmailSent(true);
//         toast.success("Password reset instructions have been sent to your email.");
//       } else {
//         toast.error(data.message || "Failed to send reset email. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error requesting password reset:", error);
//       toast.error("Network error. Please check your connection and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendEmail = () => {
//     setEmailSent(false);
//     setEmail("");
//   };

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0">
//         <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
//         <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
//         <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
//       </div>

//       {/* Main Content */}
//       <div className="flex flex-col w-full items-center justify-center p-8 relative z-10">
//         <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

//           {/* Logo Section */}
//           <div className={`flex items-center justify-center mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
//             <div className="relative group mr-4">
//               <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300 group-hover:scale-110"></div>
//               <div className="relative w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-300 shadow-2xl">
//                 <img
//                   src={logo2}
//                   alt="SWIFT Logo"
//                   className="w-12 h-12 object-cover rounded-xl"
//                 />
//                 <div className="absolute inset-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 rounded-xl"></div>
//               </div>
//             </div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent">
//               SWIFT
//             </h1>
//           </div>

//           {!emailSent ? (
//             <>
//               {/* Header Text */}
//               <div className={`text-center mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
//                 <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
//                 <p className="text-gray-300 text-lg">No worries! Enter your email and we'll send you reset instructions.</p>
//               </div>

//               {/* Forgot Password Form */}
//               <form
//                 onSubmit={handleSubmit}
//                 className={`backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
//               >
//                 <div className="space-y-6">
//                   {/* Email Field */}
//                   <div className="space-y-2">
//                     <label htmlFor="email" className="block text-white font-medium text-sm uppercase tracking-wide">
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       className={`w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none ${
//                         errors.email
//                           ? 'border-red-400'
//                           : 'border-white/20 hover:border-white/40 focus:border-cyan-400 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-400/25'
//                       }`}
//                       placeholder="Enter your email address"
//                       disabled={loading}
//                     />
//                     {errors.email && (
//                       <span className="text-red-400 text-sm animate-pulse">{errors.email}</span>
//                     )}
//                   </div>

//                   {/* Submit Button */}
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
//                   >
//                     <span className={`relative z-10 transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
//                       Send Reset Instructions
//                     </span>

//                     {/* Loading Spinner */}
//                     {loading && (
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                       </div>
//                     )}

//                     {/* Button Hover Effect */}
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                   </button>
//                 </div>

//                 {/* Additional Links */}
//                 <div className="mt-6 text-center space-y-2">
//                   <Link 
//                     to="/login" 
//                     className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 block"
//                   >
//                     Remember your password? Sign In
//                   </Link>
//                   <Link 
//                     to="/" 
//                     className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 block"
//                   >
//                     Return to Landing Page
//                   </Link>
//                 </div>
//               </form>
//             </>
//           ) : (
//             <>
//               {/* Email Sent Confirmation */}
//               <div className={`text-center mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
//                 <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
//                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                 </div>
//                 <h2 className="text-3xl font-bold text-white mb-2">Check Your Email</h2>
//                 <p className="text-gray-300 text-lg">We've sent password reset instructions to <strong>{email}</strong></p>
//               </div>

//               {/* Instructions Card */}
//               <div className={`backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
//                 <div className="space-y-6">
//                   {/* Instructions */}
//                   <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
//                     <h3 className="text-white font-semibold mb-4 flex items-center">
//                       <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       Next Steps
//                     </h3>
//                     <ul className="text-blue-200 text-sm space-y-2">
//                       <li className="flex items-start">
//                         <span className="mr-2 mt-1">1.</span>
//                         <span>Check your email inbox for a message from SWIFT</span>
//                       </li>
//                       <li className="flex items-start">
//                         <span className="mr-2 mt-1">2.</span>
//                         <span>Click the reset link within <strong>5 minutes</strong> (it expires quickly for security)</span>
//                       </li>
//                       <li className="flex items-start">
//                         <span className="mr-2 mt-1">3.</span>
//                         <span>Create a new, strong password</span>
//                       </li>
//                       <li className="flex items-start">
//                         <span className="mr-2 mt-1">4.</span>
//                         <span>Sign in with your new password</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Warning */}
//                   <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
//                     <div className="flex items-start">
//                       <svg className="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                       </svg>
//                       <div>
//                         <p className="text-amber-200 text-sm">
//                           <strong>Important:</strong> The reset link expires in 5 minutes for security. 
//                           If you don't see the email, check your spam folder or try again.
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="space-y-4">
//                     <button
//                       onClick={handleResendEmail}
//                       className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-emerald-500/50"
//                     >
//                       Send Another Email
//                     </button>
                    
//                     <Link 
//                       to="/login"
//                       className="block w-full bg-transparent border-2 border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 text-center"
//                     >
//                       Back to Login
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Floating Particles */}
//       <div className="absolute inset-0 pointer-events-none">
//         {[...Array(6)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute w-2 h-2 bg-cyan-300 rounded-full opacity-30"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
//               animationDelay: `${Math.random() * 2}s`
//             }}
//           ></div>
//         ))}
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%, 100% {
//             transform: translateY(0px) rotate(0deg);
//             opacity: 0.3;
//           }
//           50% {
//             transform: translateY(-20px) rotate(180deg);
//             opacity: 0.6;
//           }
//         }
//         .animation-delay-2000 { animation-delay: 2s; }
//         .animation-delay-4000 { animation-delay: 4s; }
//       `}</style>
//     </div>
//   );
// }





// src/pages/ForgotPassword.jsx - SIMPLE VERSION WITHOUT SCHEMA DEPENDENCIES
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import logo2 from "../assets/logo2.png";

export default function ForgotPassword() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // try {
    //   const response = await fetch("https://swift-backend-88o8.onrender.com/password/forgot", {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ email }),
    //   });

      try {
      const response = await fetch("https://swift-backend-88o8.onrender.com/password/forgot", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSent(true);
        toast.success("Password reset instructions have been sent to your email. Kindly check your email and do not forget the SPAM folders.");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
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

          {!emailSent ? (
            <>
              {/* Header Text */}
              <div className={`text-center mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-gray-300 text-lg">No worries! Enter your email and we'll send you reset instructions.</p>
              </div>

              {/* Forgot Password Form */}
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
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 rounded-2xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none border-white/20 hover:border-white/40 focus:border-cyan-400 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-400/25"
                      placeholder="Enter your email address"
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span className={`relative z-10 transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                      Send Reset Instructions
                    </span>

                    {/* Loading Spinner */}
                    {loading && (
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
                  <Link 
                    to="/" 
                    className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 block"
                  >
                    Return to Landing Page
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Email Sent Confirmation */}
              <div className={`text-center mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-300 text-lg">We've sent password reset instructions to <strong>{email}</strong></p>
              </div>

              {/* Instructions Card */}
              <div className={`backdrop-blur-lg bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4">📧 Next Steps</h3>
                    <ul className="text-blue-200 text-sm space-y-2">
                      <li>1. Check your email inbox for a message from SWIFT</li>
                      <li>2. Click the reset link within 5 minutes</li>
                      <li>3. Create a new, strong password</li>
                      <li>4. Sign in with your new password</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => setEmailSent(false)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      Send Another Email
                    </button>
                    
                    <Link 
                      to="/login"
                      className="block w-full bg-transparent border-2 border-cyan-500 hover:bg-cyan-500 text-cyan-500 hover:text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 text-center"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
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