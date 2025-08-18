export const ModalDeleteOperator = ({ Fn, data, onConfirmDelete, loading }) => {
  const handleClose = () => {
    Fn((prevState) => ({ ...prevState, open: false }));
  };

  const handleConfirmDelete = () => {
    if (onConfirmDelete && data) {
      onConfirmDelete(data.id || data._id);
    }
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Delete Operator  {/* ✅ FIXED: Changed from "Delete swimming pool" */}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              You are about to delete this operator: <strong>{data?.fname} {data?.lname}</strong>. Are you sure?
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          {/* ✅ ADDED: Actual Delete button */}
          <button
            type="button"
            disabled={loading}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
              loading 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
            onClick={handleConfirmDelete}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          
          {/* ✅ FIXED: Cancel button */}
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};