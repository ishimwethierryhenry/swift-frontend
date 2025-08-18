import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOperator, resetUpdateOperatorState } from '../redux/slices/updateOperatorSlice';
import { operatorsAvailable } from '../redux/slices/operatorsByLocationSlice';

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
    role: data?.role || 'operator', // ✅ ADD ROLE FIELD
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
        role: formData.role.toLowerCase() // ✅ Convert to lowercase
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

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 transition-opacity" onClick={handleClose}>
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full mx-4">
        <form onSubmit={handleSubmit}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {isViewMode ? 'View Operator Details' : 'Edit Operator'}
            </h3>
            
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="fname" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  value={formData.fname}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.fname ? 'border-red-300' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
                {errors.fname && (
                  <p className="mt-1 text-sm text-red-600">{errors.fname}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lname" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  value={formData.lname}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.lname ? 'border-red-300' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
                {errors.lname && (
                  <p className="mt-1 text-sm text-red-600">{errors.lname}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                {isViewMode ? (
                  <input
                    type="text"
                    value={formData.role}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                  />
                ) : (
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.role ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                    <option value="overseer">Overseer</option>
                    <option value="guest">Guest</option>
                  </select>
                )}
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              {/* Show ID in view mode */}
              {isViewMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Operator ID
                  </label>
                  <input
                    type="text"
                    value={data?.id || data?._id || 'N/A'}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                  />
                </div>
              )}
            </div>

            {/* Error message */}
            {updateOperatorState?.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  Error: {updateOperatorState.error}
                </p>
              </div>
            )}

            {/* Success message */}
            {updateOperatorState?.serverResponded && updateOperatorState?.response && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  Operator updated successfully!
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {/* Show different buttons based on mode */}
            {isEditMode && (
              <button
                type="submit"
                disabled={updateOperatorState?.loading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                  updateOperatorState?.loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {updateOperatorState?.loading ? 'Updating...' : 'Update Operator'}
              </button>
            )}
            
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};