import { useDispatch, useSelector } from "react-redux";
import { registerOperator } from "../redux/slices/operatorAddSlice";
import { userSchema } from "../validation/userSchema";
import { useEffect, useState } from "react";
import { activeLinksActions } from "../redux/slices/activeLinkSlice";

export const AddOperators = () => {
  const dispatch = useDispatch();
  const userLocation = localStorage.getItem("user_location");
  const addOperatorsState = useSelector((state) => state.operatorAdd || {
  response: null,
  loading: false,
  error: null,
  serverResponded: false,
  success: false,
  status: null
});


  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Initial empty state
  const initialFormState = {
    fname: "",
    lname: "",
    location: "",
    email: "",
    phone: "",
    gender: "",
  };
  
  const [submitData, setSubmitData] = useState(initialFormState);

  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      
      console.log("Submitting form data:", submitData);

      if (validateForm(submitData)) {
        dispatch(registerOperator(submitData));
      }
    } catch (error) {
      console.log("Form submission error:", error);
    }
  };

  const validateForm = (data) => {
    const { error } = userSchema.validate(data, { abortEarly: false });
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

  const handleInput = (e) => {
    e.preventDefault();

    setSubmitData((prevState) => ({
      ...prevState,
      fname: e.target.name === "fname" ? e.target.value : prevState.fname,
      lname: e.target.name === "lname" ? e.target.value : prevState.lname,
      email: e.target.name === "email" ? e.target.value : prevState.email,
      location: e.target.name === "location" ? e.target.value : prevState.location,
      phone: e.target.name === "phone" ? e.target.value : prevState.phone,
      gender: e.target.name === "gender" ? e.target.value : prevState.gender,
    }));
  };

  // Enhanced form clearing logic with multiple fallback conditions
  useEffect(() => {
    console.log("AddOperators state changed:", addOperatorsState);
    
    // Try multiple possible success conditions
    const isSuccess = 
      addOperatorsState.success ||
      addOperatorsState.isSuccess ||
      addOperatorsState.status === 'fulfilled' ||
      addOperatorsState.status === 'success' ||
      (addOperatorsState.response && !addOperatorsState.loading);

    const isNotLoading = !addOperatorsState.loading;

    if (isSuccess && isNotLoading) {
      console.log("🎉 Registration successful! Clearing form...");
      
      // Clear all form fields
      setSubmitData(initialFormState);
      
      // Clear any validation errors
      setErrors({});
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      console.log("✅ Form cleared successfully");
    }
  }, [
    addOperatorsState.success,
    addOperatorsState.isSuccess, 
    addOperatorsState.status,
    addOperatorsState.loading,
    addOperatorsState.response
  ]);

  // Alternative: Clear form after any successful submission (fallback)
  useEffect(() => {
    // If the form was previously loading and now it's not, and there are no errors
    if (!addOperatorsState.loading && 
        !addOperatorsState.error && 
        addOperatorsState.response) {
      
      console.log("🔄 Fallback form clearing triggered");
      setSubmitData(initialFormState);
      setErrors({});
    }
  }, [addOperatorsState.loading]);

  // Manual clear function for testing
  const handleClearForm = () => {
    console.log("🧹 Manually clearing form");
    setSubmitData(initialFormState);
    setErrors({});
    setShowSuccessMessage(false);
  };

  useEffect(() => {
    dispatch(activeLinksActions.setActiveLink("Operators"));
    setIsVisible(true);
  }, [dispatch]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements - Responsive */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-10 sm:top-40 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 sm:bottom-20 sm:left-40 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Water Bubbles - Responsive */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-300 rounded-full opacity-30 animate-bounce`}
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + i * 8}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <span className="font-semibold">Pool Operator registered successfully! 🎉</span>
          </div>
        </div>
      )}

      {/* Debug Panel (Remove in production) */}
      <div className="fixed top-4 left-4 z-40 bg-black/80 text-white p-3 rounded-lg text-xs max-w-sm">
        <h4 className="font-bold mb-2 text-cyan-400">🐛 Debug Info</h4>
        <div>Loading: {String(addOperatorsState.loading)}</div>
        <div>Success: {String(addOperatorsState.success)}</div>
        <div>Status: {addOperatorsState.status || 'undefined'}</div>
        <div>Response: {addOperatorsState.response ? '✅' : '❌'}</div>
        <div>Error: {addOperatorsState.error ? '❌' : '✅'}</div>
        <button 
          onClick={handleClearForm}
          className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Manual Clear
        </button>
      </div>

      {/* Scrollable Content Container - Responsive */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 md:pb-24">
        <div className="flex justify-center items-center min-h-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-7xl mx-auto pb-16 sm:pb-20">
          <div className={`w-full max-w-4xl transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            
            {/* Title Section - Responsive */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="overflow-hidden">
                <label className={`font-bold text-3xl sm:text-4xl md:text-5xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                  Add Pool Operator
                </label>
              </div>
              <div className="overflow-hidden">
                <label className={`font-bold text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                  Register a new pool maintenance specialist
                </label>
              </div>
              <div className="w-24 sm:w-28 md:w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-4 sm:mt-6"></div>
            </div>

            {/* Form Container - Responsive */}
            <div className={`relative group transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                  
                  {/* Name Row - Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    
                    {/* First Name */}
                    <div className={`transition-all duration-700 delay-1100 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-base sm:text-lg">First Name</label>
                      <input
                        type="text"
                        name="fname"
                        id="fname"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.fname}
                        placeholder="Enter first name"
                      />
                      {errors.fname && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.fname}</span>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className={`transition-all duration-700 delay-1200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Last Name</label>
                      <input
                        type="text"
                        name="lname"
                        id="lname"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.lname}
                        placeholder="Enter last name"
                      />
                      {errors.lname && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.lname}</span>
                      )}
                    </div>
                  </div>

                  {/* Email - Full Width */}
                  <div className={`transition-all duration-700 delay-1300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                    <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Email Address</label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      onChange={handleInput}
                      className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                      value={submitData.email}
                      placeholder="email@gmail.com"
                    />
                    {errors.email && (
                      <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.email}</span>
                    )}
                  </div>

                  {/* Phone and Gender Row - Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    
                    {/* Phone Number */}
                    <div className={`transition-all duration-700 delay-1400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.phone}
                        placeholder="+250 788 123 456"
                      />
                      {errors.phone && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.phone}</span>
                      )}
                    </div>

                    {/* Gender */}
                    <div className={`transition-all duration-700 delay-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Gender</label>
                      <select
                        name="gender"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        id="gender"
                        value={submitData.gender}
                      >
                        <option value="" className="bg-slate-800 text-white">Select gender</option>
                        <option value="Male" className="bg-slate-800 text-white">Male</option>
                        <option value="Female" className="bg-slate-800 text-white">Female</option>
                        <option value="Other" className="bg-slate-800 text-white">Prefer Not to Say</option>
                      </select>
                      {errors.gender && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.gender}</span>
                      )}
                    </div>
                  </div>

                  {/* Location - Full Width */}
                  <div className={`transition-all duration-700 delay-1600 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                    <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Location</label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      onChange={handleInput}
                      className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                      value={submitData.location}
                      placeholder="Olympic Hotel"
                    />
                    {errors.location && (
                      <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.location}</span>
                    )}
                  </div>

                  {/* Submit Button - Responsive */}
                  <div className={`flex justify-center pt-4 sm:pt-6 transition-all duration-1000 delay-1700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <button
                      type="submit"
                      disabled={addOperatorsState.loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white text-lg sm:text-xl font-semibold px-8 sm:px-12 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 group relative overflow-hidden disabled:cursor-not-allowed disabled:transform-none min-h-[48px]"
                    >
                      <span className="relative z-10">
                        {addOperatorsState.loading ? 'Adding Operator...' : 'Add Operator'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Ensure select dropdown visibility on mobile */
        select option {
          background-color: #1e293b;
          color: white;
        }
        
        /* Touch-friendly form elements */
        @media (max-width: 768px) {
          input, select, button {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};