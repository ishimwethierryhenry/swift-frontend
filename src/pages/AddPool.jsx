import { useEffect, useState } from "react";
import { operatorsAvailable } from "../redux/slices/operatorsByLocationSlice";
import { useDispatch, useSelector } from "react-redux";
import { poolSchema } from "../validation/poolSchema";
import { registerPool } from "../redux/slices/poolAddSlice";
import { activeLinksActions } from "../redux/slices/activeLinkSlice";

export const AddPool = () => {
  const dispatch = useDispatch();
  const userLocation = localStorage.getItem("user_location");
  const addOperatorsState = useSelector((state) => state.poolAdd || {
  response: null,
  loading: false,
  error: null,
  serverResponded: false,
});
  const operatorsAvailableState = useSelector((state) => state.operatorsByLocation || {
  response: null,
  loading: false,
  error: null,
  serverResponded: false,
});
  const [operators, setOperators] = useState([]);
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  
  // Initial form state - extracted to a separate object for reusability
  const initialFormState = {
    name: "",
    location: "",
    l: "",
    w: "",
    depth: "",
    assigned_to: "",
  };
  
  const [submitData, setSubmitData] = useState(initialFormState);

  const handleSubmit = (e) => {
    try {
      e.preventDefault();

      if (validateForm(submitData)) {
        dispatch(registerPool(submitData));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const validateForm = (data) => {
    const { error } = poolSchema.validate(data, { abortEarly: false });
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
      name: e.target.name === "name" ? e.target.value : prevState.name,
      l: e.target.name === "l" ? e.target.value : prevState.l,
      w: e.target.name === "w" ? e.target.value : prevState.w,
      depth: e.target.name === "depth" ? e.target.value : prevState.depth,
      assigned_to:
        e.target.name === "assigned_to"
          ? e.target.value
          : prevState.assigned_to,
      location:
        e.target.name === "location" ? e.target.value : prevState.location,
    }));
  };

  // Clear form after successful registration
  useEffect(() => {
  if (addOperatorsState?.serverResponded && !addOperatorsState?.loading && !addOperatorsState?.error) {
    setSubmitData(initialFormState);
    setErrors({});
  }
}, [addOperatorsState?.serverResponded, addOperatorsState?.loading, addOperatorsState?.error]);

  useEffect(() => {
  if (operatorsAvailableState?.serverResponded && operatorsAvailableState?.response) {
    setOperators(operatorsAvailableState.response);
  }
}, [operatorsAvailableState?.serverResponded, operatorsAvailableState?.response]);

  useEffect(() => {
    dispatch(operatorsAvailable(userLocation));
    dispatch(activeLinksActions.setActiveLink("Pools"));
    setIsVisible(true);
  }, []);

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

      {/* Scrollable Content Container - Responsive */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 md:pb-24">
        <div className="flex justify-center items-center min-h-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-7xl mx-auto pb-16 sm:pb-20">
          <div className={`w-full max-w-4xl transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            
            {/* Title Section - Responsive */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="overflow-hidden">
                <label className={`font-bold text-3xl sm:text-4xl md:text-5xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                  Add Swimming Pool
                </label>
              </div>
              <div className="overflow-hidden">
                <label className={`font-bold text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                  Configure your pool monitoring system
                </label>
              </div>
              <div className="w-24 sm:w-28 md:w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-4 sm:mt-6"></div>
            </div>

            {/* Form Container - Responsive */}
            <div className={`relative group transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                  
                  {/* Pool Name - Full Width */}
                  <div className={`transition-all duration-700 delay-1100 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                    <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Pool Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      onChange={handleInput}
                      className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                      value={submitData.name}
                      placeholder="Enter pool name"
                    />
                    {errors.name && (
                      <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.name}</span>
                    )}
                  </div>

                  {/* Location - Full Width */}
                  <div className={`transition-all duration-700 delay-1200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
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

                  {/* Dimensions Row - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    
                    {/* Length */}
                    <div className={`transition-all duration-700 delay-1300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-sm sm:text-base">Length (m)</label>
                      <input
                        type="text"
                        name="l"
                        id="l"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.l}
                        placeholder="e.g. 25"
                      />
                      {errors.l && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.l}</span>
                      )}
                    </div>

                    {/* Width */}
                    <div className={`transition-all duration-700 delay-1400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-sm sm:text-base">Width (m)</label>
                      <input
                        type="text"
                        name="w"
                        id="w"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.w}
                        placeholder="e.g. 12"
                      />
                      {errors.w && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.w}</span>
                      )}
                    </div>

                    {/* Depth */}
                    <div className={`transition-all duration-700 delay-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} sm:col-span-2 lg:col-span-1`}>
                      <label className="block text-white font-semibold mb-2 text-sm sm:text-base">Depth (m)</label>
                      <input
                        type="text"
                        name="depth"
                        id="depth"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.depth}
                        placeholder="e.g. 1.5"
                      />
                      {errors.depth && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.depth}</span>
                      )}
                    </div>
                  </div>

                  {/* Assign Operator - Full Width */}
                  <div className={`transition-all duration-700 delay-1600 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                    <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Assign to Operator</label>
                    <select
                      name="assigned_to"
                      onChange={handleInput}
                      className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                      id="assigned_to"
                      value={submitData.assigned_to}
                    >
                      <option value="" className="bg-slate-800 text-white">Select an operator</option>
                      {operators.map((operator) => (
                        <option key={operator.id} value={operator.id} className="bg-slate-800 text-white">
                          {operator.fname} {operator.lname}
                        </option>
                      ))}
                    </select>
                    <p className="text-gray-300 text-xs sm:text-sm mt-2">
                      Only registered operators are available in the list
                    </p>
                    {errors.assigned_to && (
                      <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.assigned_to}</span>
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
                        {addOperatorsState?.loading ? 'Adding Pool...' : 'Add Pool'}
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