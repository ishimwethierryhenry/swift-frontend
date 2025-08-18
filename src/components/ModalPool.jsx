import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePool, resetUpdatePoolState } from "../redux/slices/updatePoolSlice";
import { poolsAssigned } from "../redux/slices/poolsAssignedSlice";
import { poolsAvailable } from "../redux/slices/poolsByLocationSlice";
import { poolSchema } from "../validation/poolSchema";

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

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center overflow-hidden">
      {/* ✅ SIMPLE WORKING SOLUTION: Clickable backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 opacity-75 cursor-pointer"
        onClick={handleClose}
      ></div>

      {/* Modal content */}
      <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full mx-4 relative z-10">
        <form onSubmit={handleSubmit}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Update Swimming Pool Details
            </h3>
            
            <div className="space-y-4">
              {/* Pool Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Pool Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  onChange={handleInput}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={submitData.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  onChange={handleInput}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={submitData.location}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Depth */}
              <div>
                <label htmlFor="depth" className="block text-sm font-medium text-gray-700">
                  Depth (meters)
                </label>
                <input
                  type="text"
                  name="depth"
                  id="depth"
                  onChange={handleInput}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.depth ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={submitData.depth}
                />
                {errors.depth && (
                  <p className="mt-1 text-sm text-red-600">{errors.depth}</p>
                )}
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (meters)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="l" className="block text-xs text-gray-600">Length</label>
                    <input
                      type="text"
                      name="l"
                      id="l"
                      onChange={handleInput}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.l ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={submitData.l}
                    />
                    {errors.l && (
                      <p className="mt-1 text-xs text-red-600">{errors.l}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="w" className="block text-xs text-gray-600">Width</label>
                    <input
                      type="text"
                      name="w"
                      id="w"
                      onChange={handleInput}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.w ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={submitData.w}
                    />
                    {errors.w && (
                      <p className="mt-1 text-xs text-red-600">{errors.w}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Assign to Operator */}
              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                  Assign to Operator
                </label>
                <select
                  name="assigned_to"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.assigned_to ? 'border-red-300' : 'border-gray-300'
                  }`}
                  id="assigned_to"
                  onChange={handleInput}
                  value={submitData.assigned_to}
                >
                  <option value="">Select an operator</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.fname} {op.lname}
                    </option>
                  ))}
                </select>
                {errors.assigned_to && (
                  <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>
                )}
              </div>
            </div>

            {/* Error message */}
            {updatePoolState?.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  Error: {updatePoolState.error}
                </p>
              </div>
            )}

            {/* Success message */}
            {updatePoolState?.serverResponded && updatePoolState?.response && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  Pool updated successfully!
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              disabled={updatePoolState?.loading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                updatePoolState?.loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {updatePoolState?.loading ? 'Updating...' : 'Update Pool'}
            </button>
            
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};