import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePool } from "../redux/slices/poolUpdateSlice";
import { poolSchema } from "../validation/poolSchema";

export const ModalPool = ({ Fn, data, operators }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [submitData, setSubmitData] = useState({
    name: data.name,
    location: data.location,
    l: data.l,
    w: data.w,
    depth: data.depth,
    assigned_to: data.assigned_to,
  });

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

  const handleAction = () => {
    Fn((prevState) => ({ ...prevState, open: false }));
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Update Swimming pool details
          </h3>
          <div className="mt-2">
            <div className="flex flex-col w-full max-h-[90%] bg-white p-4 rounded-md">
              <div className="flex flex-col mt-6 overflow-y-scroll gap-4">
                <form onSubmit={handleSubmit}>
                  <div className="md:col-span-5">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      onChange={handleInput}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                      value={submitData.name}
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label>Depth</label>
                    <input
                      type="text"
                      name="depth"
                      id="depth"
                      onChange={handleInput}
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                      value={submitData.depth}
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label>Dimensions</label>
                    <div className="flex flex-row gap-3">
                      <div>
                        <label className=" text-black text-sm">Length</label>
                        <input
                          type="text"
                          name="l"
                          id="l"
                          onChange={handleInput}
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          value={submitData.l}
                        />
                      </div>

                      <div>
                        <label className=" text-black text-sm">Width</label>
                        <input
                          type="text"
                          name="w"
                          id="w"
                          onChange={handleInput}
                          className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                          value={submitData.w}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/3">
                    <label>Assign to</label>
                    <select
                      name="assigned_to"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                      id="assigned_to"
                      onChange={handleInput}
                      value={submitData.assigned_to}
                    >
                      {operators.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.fname} {op.lname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-5 text-right">
                    <div className="flex flex-row justify-end gap-2">
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Submit
                      </button>
                      <button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleAction}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};