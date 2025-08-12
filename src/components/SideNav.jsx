import { Link } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { LiaSwimmingPoolSolid } from "react-icons/lia";
import { GrUserManager } from "react-icons/gr";
import { BiSolidNetworkChart } from "react-icons/bi";
import { FaHistory } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { activeLinksActions } from "../redux/slices/activeLinkSlice";

export const SideNav = ({ label, destination, active = false }) => {
  const dispatch = useDispatch();
  return (
    <Link
      to={destination}
      className={`flex flex-row items-center gap-3 p-2 rounded-full ${
        active && " bg-black"
      }`}
      onClick={() => dispatch(activeLinksActions.setActiveLink(label))}
    >
      {label === "Overview" && (
        <MdDashboard
          className={`${active ? " text-white" : "text-gray-600"} ml-4`}
          size={24}
        />
      )}
      
      {label === "Pools" && (
        <LiaSwimmingPoolSolid
          className={`${active ? " text-white" : "text-gray-600"} ml-4`}
          size={24}
        />
      )}

      {label === "Operators" && (
        <GrUserManager
          className={`${active ? " text-white" : "text-gray-600"} ml-4`}
          size={24}
        />
      )}
      {label === "Prediction" && (
        <BiSolidNetworkChart
          className={`${active ? " text-white" : "text-gray-600"} ml-4`}
          size={24}
        />
      )}

      {label === "History" && (
        <FaHistory
          className={`${active ? " text-white" : "text-gray-600"} ml-4`}
          size={24}
        />
      )}

      <label className={`${active ? " text-white" : "text-gray-600"} text-xl`}>
        {label}
      </label>
    </Link>
  );
};
