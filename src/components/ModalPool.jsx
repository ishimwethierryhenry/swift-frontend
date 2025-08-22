import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePool, resetUpdatePoolState } from "../redux/slices/updatePoolSlice";
import { poolsAssigned } from "../redux/slices/poolsAssignedSlice";
import { poolsAvailable } from "../redux/slices/poolsByLocationSlice";
import { poolSchema } from "../validation/poolSchema";
import { Waves, X, Loader2, Save, Users } from 'lucide-react';

export const ModalPool = ({ Fn, data, operators }) => {
  const dispatch = useDispatch();
  
  // Get update pool state and user info
  const updatePoolState = useSelector((state) => state.updatePool || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });
  
  const userRole = localStorage.getItem("user_role");
  const userId = localStorage.getItem("user_id");
  const userLocation = localStorage.getItem("user_location");

  const [errors, setErrors] = useState({});
  const [submitData, setSubmitData] = useState({
    name: data?.name || '',
    location: data?.location || '',
    l: data?.l || '',
    w: data?.w || '',
    depth: data?.depth || '',
    assigned_to: data?.assigned_to || '',
  });

  // Handle successful update - refresh data and close modal
  useEffect(() => {
    if (updatePoolState?.serverResponded && updatePoolState?.response) {
      console.log('✅ Pool update successful, refreshing pools list...');
      
      // Refresh the appropriate pools list based on user role
      if (userRole === "operator" && userId) {
        dispatch(poolsAssigned(userId));
      } else if (userRole === "admin" && userLocation) {
        dispatch(poolsAvailable(userLocation));
      }
      
      // Close modal after a short delay to let user see success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  }, [updatePoolState?.serverResponded, updatePoolState?.response]);

  const handleSubmit = (e) => {
    try {
      e.preventDefault();

      if (validateForm(submitData)) {
        dispatch(
          updatePool({
            formData: {
              newLength: submitData.l,
              newName: submitData.name,
              newWidth: submitData.w,
              newLocation: submitData.location,
              newDepth: submitData.depth,
              newAssign: submitData.assigned_to,
            },
            poolId: data.id,
          })
        );
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
    const { name, value } = e.target;
    
    setSubmitData((prevState) => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Enhanced close handler
  const handleClose = () => {
    // Reset any form errors
    setErrors({});
    // Reset the update state
    dispatch(resetUpdatePoolState());
    // Close the modal
    Fn((prevState) => ({ ...prevState, open: false, data: null }));
  };

  // Prevent modal from closing when clicking inside the modal content
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="relative">
      {/* Backdrop with outside click functionality */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden backdrop-blur-sm"
        onClick={handleClose}
      >
        {/* Enhanced glassmorphism backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-cyan-900/30 to-gray-900/40 backdrop-blur-md"></div>

        {/* Enhanced Glassmorphism Container */}
        <div 
          className="relative bg-gradient-to-br from-slate-800/60 via-cyan-900/60 to-blue-800/60 backdrop-blur-2xl rounded-2xl border border-cyan-400/30 shadow-2xl max-w-lg mx-4 w-full overflow-hidden transform transition-all duration-300 scale-100 hover:scale-102"
          onClick={handleModalClick}
        >
          
          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-cyan-400/30 via-blue-400/20 to-teal-400/30 p-px animate-pulse">
            <div className="h-full w-full rounded-2xl bg-gradient-to-br from-slate-800/80 via-cyan-900/80 to-blue-800/80 backdrop-blur-2xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Waves className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Update Swimming Pool Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="px-6 pb-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {/* Pool Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-cyan-300 mb-2">
                      Pool Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      onChange={handleInput}
                      value={submitData.name}
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                        errors.name ? 'border-red-400/50' : ''
                      }`}
                      placeholder="Enter pool name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-300">{errors.name}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-cyan-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      onChange={handleInput}
                      value={submitData.location}
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                        errors.location ? 'border-red-400/50' : ''
                      }`}
                      placeholder="Enter location"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-300">{errors.location}</p>
                    )}
                  </div>

                  {/* Depth */}
                  <div>
                    <label htmlFor="depth" className="block text-sm font-medium text-cyan-300 mb-2">
                      Depth (meters)
                    </label>
                    <input
                      type="text"
                      name="depth"
                      id="depth"
                      onChange={handleInput}
                      value={submitData.depth}
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                        errors.depth ? 'border-red-400/50' : ''
                      }`}
                      placeholder="e.g., 2.5"
                    />
                    {errors.depth && (
                      <p className="mt-1 text-sm text-red-300">{errors.depth}</p>
                    )}
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-3">
                      Dimensions (meters)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="l" className="block text-xs text-gray-300 mb-1">Length</label>
                        <input
                          type="text"
                          name="l"
                          id="l"
                          onChange={handleInput}
                          value={submitData.l}
                          className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                            errors.l ? 'border-red-400/50' : ''
                          }`}
                          placeholder="e.g., 25"
                        />
                        {errors.l && (
                          <p className="mt-1 text-xs text-red-300">{errors.l}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="w" className="block text-xs text-gray-300 mb-1">Width</label>
                        <input
                          type="text"
                          name="w"
                          id="w"
                          onChange={handleInput}
                          value={submitData.w}
                          className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                            errors.w ? 'border-red-400/50' : ''
                          }`}
                          placeholder="e.g., 12"
                        />
                        {errors.w && (
                          <p className="mt-1 text-xs text-red-300">{errors.w}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assign to Operator */}
                  <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-cyan-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Assign to Operator
                      </div>
                    </label>
                    <select
                      name="assigned_to"
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                        errors.assigned_to ? 'border-red-400/50' : ''
                      }`}
                      id="assigned_to"
                      onChange={handleInput}
                      value={submitData.assigned_to}
                    >
                      <option value="" className="bg-slate-800 text-white">Select an operator</option>
                      {operators.map((op) => (
                        <option key={op.id} value={op.id} className="bg-slate-800 text-white">
                          {op.fname} {op.lname}
                        </option>
                      ))}
                    </select>
                    {errors.assigned_to && (
                      <p className="mt-1 text-sm text-red-300">{errors.assigned_to}</p>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {updatePoolState?.error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-red-300">
                      Error: {updatePoolState.error}
                    </p>
                  </div>
                )}

                {/* Success message */}
                {updatePoolState?.serverResponded && updatePoolState?.response && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-green-300">
                      Pool updated successfully!
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-all duration-200 font-medium backdrop-blur-sm"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={updatePoolState?.loading}
                  className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg transform hover:scale-105 disabled:hover:scale-100 ${
                    updatePoolState?.loading
                      ? 'bg-cyan-500/50 border border-cyan-400/30 text-cyan-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-400/50 text-white hover:from-cyan-600 hover:to-blue-600'
                  }`}
                >
                  {updatePoolState?.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Pool
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        /* Enhanced glassmorphism effects */
        .backdrop-blur-2xl {
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        /* Enhanced focus states */
        input:focus, textarea:focus, select:focus {
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.3), 0 0 25px rgba(6, 182, 212, 0.1);
        }
        
        button:focus {
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.3), 0 0 25px rgba(6, 182, 212, 0.1);
          outline: none;
        }
        
        /* Smooth animations */
        * {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Hover scale animations */
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        /* Custom scrollbar for modal content */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
        
        /* Option styling for selects */
        option {
          background-color: rgb(30 41 59);
          color: white;
        }
      `}</style>
    </div>
  );
};