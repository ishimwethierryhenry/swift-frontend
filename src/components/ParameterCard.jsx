import React from "react";

function ParameterCard({
  title,
  value,
  color = "bg-green-400",
  status,
  unit = null,
}) {
  return (
    <div
      className={` flex flex-col  ${color} justify-between w-[33%] h-40 rounded-md p-3 border-[1px] border-gray-400`}
    >
      <h2 className=" font-bold text-3xl">{title}</h2>
      <div className="flex flex-row  justify-between">
        <p className=" text-2xl">
          {value} {unit && unit}
        </p>
        <button
          className={`${
            status === "Safe" ? "bg-green-400" : " bg-red-400"
          }  rounded-full text-white px-1 py-0 text-sm`}
        >
          {status}
        </button>
      </div>
    </div>
  );
}

export default ParameterCard;