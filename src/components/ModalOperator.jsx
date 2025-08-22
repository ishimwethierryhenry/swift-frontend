import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOperator, resetUpdateOperatorState } from '../redux/slices/updateOperatorSlice';
import { operatorsAvailable } from '../redux/slices/operatorsByLocationSlice';
import { User, X, Loader2, Save, Mail, Phone, MapPin, Shield } from 'lucide-react';

export const ModalOperator = ({ data, Fn, mode = 'edit' }) => {
  const dispatch = useDispatch();
  const updateOperatorState = useSelector((state) => state.updateOperator || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });

  const userLocation = localStorage.getItem('user_location');

  // Form state
  const [formData, setFormData] = useState({
    fname: data?.fname || '',
    lname: data?.lname || '',
    email: data?.email || '',
    phone: data?.phone || '',
    location: data?.location || '',
    role: data?.role || 'operator',
  });

  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fname.trim()) {
      newErrors.fname = 'First name is required';
    }
    
    if (!formData.lname.trim()) {
      newErrors.lname = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Ensure role is lowercase to match backend expectations
      const submitData = {
        ...formData,
        role: formData.role.toLowerCase()
      };
      
      // Dispatch update action with operator ID and form data
      dispatch(updateOperator({
        id: data.id || data._id,
        ...submitData
      }));
    } catch (error) {
      console.error('Error updating operator:', error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    // Reset any form errors
    setErrors({});
    // Reset the update state
    dispatch(resetUpdateOperatorState());
    // Close the modal
    Fn({ id: null, open: false, data: null });
  };

  // Handle successful update
  useEffect(() => {
    if (updateOperatorState?.serverResponded && updateOperatorState?.response) {
      console.log('✅ Update successful, refreshing operators list...');
      
      // Refresh the operators list
      if (userLocation) {
        dispatch(operatorsAvailable(userLocation));
      }
      
      // Close modal after a short delay to let user see success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  }, [updateOperatorState?.serverResponded, updateOperatorState?.response]);

  // Prevent modal from closing when clicking inside the modal content
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

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
                    <User className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {isViewMode ? 'View Operator Details' : 'Edit Operator'}
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
                  {/* Name Fields */}
                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-3">
                      Full Name
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="fname" className="block text-xs text-gray-300 mb-1">First Name</label>
                        <input
                          type="text"
                          id="fname"
                          name="fname"
                          value={formData.fname}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                          className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                            errors.fname ? 'border-red-400/50' : ''
                          } ${isViewMode ? 'cursor-not-allowed opacity-60' : ''}`}
                          placeholder="First name"
                        />
                        {errors.fname && (
                          <p className="mt-1 text-xs text-red-300">{errors.fname}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lname" className="block text-xs text-gray-300 mb-1">Last Name</label>
                        <input
                          type="text"
                          id="lname"
                          name="lname"
                          value={formData.lname}
                          onChange={handleInputChange}
                          disabled={isViewMode}
                          className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                            errors.lname ? 'border-red-400/50' : ''
                          } ${isViewMode ? 'cursor-not-allowed opacity-60' : ''}`}
                          placeholder="Last name"
                        />
                        {errors.lname && (
                          <p className="mt-1 text-xs text-red-300">{errors.lname}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-cyan-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </div>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                        errors.email ? 'border-red-400/50' : ''
                      } ${isViewMode ? 'cursor-not-allowed opacity-60' : ''}`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-300">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-cyan-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </div>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                        errors.phone ? 'border-red-400/50' : ''
                      } ${isViewMode ? 'cursor-not-allowed opacity-60' : ''}`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-300">{errors.phone}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-cyan-300 mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                        errors.location ? 'border-red-400/50' : ''
                      } ${isViewMode ? 'cursor-not-allowed opacity-60' : ''}`}
                      placeholder="Enter location"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-300">{errors.location}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-cyan-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Role
                      </div>
                    </label>
                    {isViewMode ? (
                      <input
                        type="text"
                        value={formData.role}
                        disabled
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white cursor-not-allowed opacity-60 backdrop-blur-sm"
                      />
                    ) : (
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm ${
                          errors.role ? 'border-red-400/50' : ''
                        }`}
                      >
                        <option value="" className="bg-slate-800 text-white">Select a role</option>
                        <option value="admin" className="bg-slate-800 text-white">Admin</option>
                        <option value="operator" className="bg-slate-800 text-white">Operator</option>
                        <option value="overseer" className="bg-slate-800 text-white">Overseer</option>
                        <option value="guest" className="bg-slate-800 text-white">Guest</option>
                      </select>
                    )}
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-300">{errors.role}</p>
                    )}
                  </div>

                  {/* Show ID in view mode */}
                  {isViewMode && (
                    <div>
                      <label className="block text-sm font-medium text-cyan-300 mb-2">
                        Operator ID
                      </label>
                      <input
                        type="text"
                        value={data?.id || data?._id || 'N/A'}
                        disabled
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white cursor-not-allowed opacity-60 backdrop-blur-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Error message */}
                {updateOperatorState?.error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-red-300">
                      Error: {updateOperatorState.error}
                    </p>
                  </div>
                )}

                {/* Success message */}
                {updateOperatorState?.serverResponded && updateOperatorState?.response && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-green-300">
                      Operator updated successfully!
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
                  {isViewMode ? 'Close' : 'Cancel'}
                </button>
                
                {isEditMode && (
                  <button
                    type="submit"
                    disabled={updateOperatorState?.loading}
                    className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg transform hover:scale-105 disabled:hover:scale-100 ${
                      updateOperatorState?.loading
                        ? 'bg-cyan-500/50 border border-cyan-400/30 text-cyan-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-400/50 text-white hover:from-cyan-600 hover:to-blue-600'
                    }`}
                  >
                    {updateOperatorState?.loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Update Operator
                      </>
                    )}
                  </button>
                )}
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