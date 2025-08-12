import { useEffect, useState } from "react";
import { TablePools } from "./TablePools";
import { useDispatch, useSelector } from "react-redux";
import { poolsAvailable } from "../redux/slices/poolsByLocationSlice";

export const ModalLocation = ({ Fn, location, role }) => {
  const dispatch = useDispatch();

  const poolsAvailableState = useSelector((state) => state.poolsByLocation);
  const handleAction = () => {
    Fn((prevState) => ({ ...prevState, open: false }));
  };

  const [pools, setPools] = useState([]);

  useEffect(() => {
    if (poolsAvailableState.serverResponded) {
      setPools(poolsAvailableState.response);
    }
  }, [poolsAvailableState.serverResponded]);

  useEffect(() => {
    dispatch(poolsAvailable(location));
  }, []);
  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="bg-white w-full rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-[80%] sm:w-full">
        <div className="bg-white w-full px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pools - {location}
          </h3>
          <div className="mt-2">
            <TablePools pools={pools} role={role} />
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleAction}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};