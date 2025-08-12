import React, { useEffect, useState } from "react";
import { ModalPool } from "../components/ModalPool";
import { ModalDeletePool } from "../components/ModalDeletePool";
import { useDispatch, useSelector } from "react-redux";
import { ModalLocation } from "../components/ModalLocation";
import { poolsAssigned } from "../redux/slices/poolsAssignedSlice";
import { poolsAvailable } from "../redux/slices/poolsByLocationSlice";
import { operatorsAvailable } from "../redux/slices/operatorsByLocationSlice";
import { ModalDeleteOperator } from "../components/ModalDeleteOperator";
import { getLocations } from "../redux/slices/locationsSlice";

export const Dashboard = () => {
  const userState = useSelector((state) => state.user.user);
  const loginState = useSelector((state) => state.login);
  const poolsAssignedState = useSelector((state) => state.assignedPools);
  const poolsAvailableState = useSelector((state) => state.poolsByLocation);
  const locationsState = useSelector((state) => state.locations);
  const operatorsAvailableState = useSelector(
    (state) => state.operatorsByLocation
  );

  const dispatch = useDispatch();
  const userId = localStorage.getItem("user_id");
  const userRole = localStorage.getItem("user_role");
  const userLocation = localStorage.getItem("user_location");

  const [isVisible, setIsVisible] = useState(false);
  const [poolEditModal, setPoolEditModal] = useState({
    id: null,
    open: false,
    data: null,
  });
  const [locationModal, setLocationModal] = useState({ id: null, open: false });
  const [pools, setPools] = useState([
    { name: "pool01", depth: "1.2m", length: "9m", width: "4.5m", status: "Offline" },
    { name: "pool02", depth: "1.2m", length: "12m", width: "6m", status: "Offline" },
    { name: "Pool3", depth: "1.5m", length: "9m", width: "4.5m", status: "Offline" }
  ]);
  const [operators, setOperators] = useState([
    { firstName: "John", lastName: "Doe", phone: "0783726894", email: "john@gmail.com", location: "serena" }
  ]);
  const [locations, setLocations] = useState([
    { name: "Olympic Location", pools: 3, operators: 1 },
    { name: "Downtown Location", pools: 2, operators: 2 },
    { name: "Uptown Location", pools: 4, operators: 3 }
  ]);

  const [poolDeleteModal, setPoolDeleteModal] = useState({
    id: null,
    open: false,
  });
  const [operatorDeleteModal, setOperatorDeleteModal] = useState({
    id: null,
    open: false,
  });

  const handleDelete = (id) => {};
  const handleEdit = (pool) => {
    setPoolEditModal({ id: pool.name, open: true, data: pool });
  };
  const handleView = (location) => {
    setLocationModal({ id: location.name, open: true });
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (locationsState.serverResponded) {
      setLocations(locationsState.response);
    }
  }, [locationsState.serverResponded]);

  useEffect(() => {
    if (operatorsAvailableState.serverResponded) {
      setOperators(operatorsAvailableState.response);
    }
  }, [operatorsAvailableState.serverResponded]);

  useEffect(() => {
    if (poolsAvailableState.serverResponded) {
      setPools(poolsAvailableState.response);
    }
  }, [poolsAvailableState.serverResponded]);

  useEffect(() => {
    if (poolsAssignedState.serverResponded) {
      setPools(poolsAssignedState.response);
    }
  }, [poolsAssignedState.serverResponded]);

  useEffect(() => {
    if (userRole === "operator") {
      dispatch(poolsAssigned(userId));
    } else if (userRole === "admin") {
      dispatch(poolsAvailable(userLocation));
      dispatch(operatorsAvailable(userLocation));
    } else if (userRole === "overseer") {
      dispatch(getLocations());
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 md:top-20 md:left-20 w-32 h-32 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-20 right-10 md:top-40 md:right-20 w-32 h-32 md:w-96 md:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 md:bottom-20 md:left-40 w-32 h-32 md:w-96 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Water Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 md:w-3 md:h-3 bg-cyan-300 rounded-full opacity-20 animate-bounce"
            style={{
              left: `${15 + i * 15}%`,
              top: `${25 + i * 10}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + i * 0.3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-24">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Dashboard Header */}
          <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="text-center">
              <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-2 md:mb-4">
                Dashboard Overview
              </h1>
              <div className="w-20 md:w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Admin Role - Pools Section */}
          {userRole === "admin" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div className="flex flex-col gap-2">
                      <h2 className="font-bold text-2xl lg:text-3xl text-white">Swimming Pools</h2>
                      <p className="font-semibold text-lg text-cyan-300">
                        {pools.length} total pools
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pools Display */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 overflow-x-auto">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <table className="w-full text-white min-w-full">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">NAME</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">DEPTH</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">LENGTH</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">WIDTH</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">STATUS</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pools.map((pool, index) => (
                            <tr key={index} className="border-b border-white/10">
                              <td className="p-3 text-sm whitespace-nowrap">{pool.name}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{pool.depth}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{pool.length}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{pool.width}</td>
                              <td className="p-3">
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap">
                                  {pool.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 whitespace-nowrap">View</button>
                                  <button 
                                    onClick={() => handleEdit(pool)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 whitespace-nowrap"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {pools.map((pool, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-semibold text-lg">{pool.name}</h3>
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                              {pool.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                            <div>
                              <span className="text-gray-300 block">Depth</span>
                              <p className="text-white font-medium">{pool.depth}</p>
                            </div>
                            <div>
                              <span className="text-gray-300 block">Length</span>
                              <p className="text-white font-medium">{pool.length}</p>
                            </div>
                            <div>
                              <span className="text-gray-300 block">Width</span>
                              <p className="text-white font-medium">{pool.width}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded text-sm flex-1 hover:bg-gray-600">View</button>
                            <button 
                              onClick={() => handleEdit(pool)}
                              className="bg-yellow-500 text-white px-4 py-2 rounded text-sm flex-1 hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Role - Operators Section */}
          {userRole === "admin" && (
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div className="flex flex-col gap-2">
                      <h2 className="font-bold text-2xl lg:text-3xl text-white">Operators</h2>
                      <p className="font-semibold text-lg text-blue-300">
                        {operators.length} active operators
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Operators Display */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 overflow-x-auto">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <table className="w-full text-white min-w-full">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">FIRST NAME</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">LAST NAME</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">PHONE NUMBER</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">EMAIL</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">LOCATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {operators.map((operator, index) => (
                            <tr key={index} className="border-b border-white/10">
                              <td className="p-3 text-sm whitespace-nowrap">{operator.firstName}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{operator.lastName}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{operator.phone}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{operator.email}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{operator.location}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {operators.map((operator, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="mb-3">
                            <h3 className="text-white font-semibold text-lg">
                              {operator.firstName} {operator.lastName}
                            </h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Phone:</span>
                              <span className="text-white">{operator.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Email:</span>
                              <span className="text-white break-all">{operator.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Location:</span>
                              <span className="text-white">{operator.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operator Role - Assigned Pools */}
          {userRole === "operator" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div className="flex flex-col gap-2">
                      <h2 className="font-bold text-2xl lg:text-3xl text-white">Your Assigned Pools</h2>
                      <p className="font-semibold text-lg text-cyan-300">
                        {pools.length} pools under your care
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pools Display (Same structure as admin) */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 overflow-x-auto">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <table className="w-full text-white min-w-full">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">NAME</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">DEPTH</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">LENGTH</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">WIDTH</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">STATUS</th>
                            <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pools.map((pool, index) => (
                            <tr key={index} className="border-b border-white/10">
                              <td className="p-3 text-sm whitespace-nowrap">{pool.name}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{pool.depth}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{pool.length}</td>
                              <td className="p-3 text-sm whitespace-nowrap">{pool.width}</td>
                              <td className="p-3">
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap">
                                  {pool.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 whitespace-nowrap">View</button>
                                  <button 
                                    onClick={() => handleEdit(pool)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 whitespace-nowrap"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {pools.map((pool, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-semibold text-lg">{pool.name}</h3>
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                              {pool.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                            <div>
                              <span className="text-gray-300 block">Depth</span>
                              <p className="text-white font-medium">{pool.depth}</p>
                            </div>
                            <div>
                              <span className="text-gray-300 block">Length</span>
                              <p className="text-white font-medium">{pool.length}</p>
                            </div>
                            <div>
                              <span className="text-gray-300 block">Width</span>
                              <p className="text-white font-medium">{pool.width}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-gray-500 text-white px-4 py-2 rounded text-sm flex-1 hover:bg-gray-600">View</button>
                            <button 
                              onClick={() => handleEdit(pool)}
                              className="bg-yellow-500 text-white px-4 py-2 rounded text-sm flex-1 hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overseer Role - Locations and Map */}
          {userRole === "overseer" && (
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Locations Section */}
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                      <div className="flex flex-col gap-2">
                        <h2 className="font-bold text-2xl lg:text-3xl text-white">Available Locations</h2>
                        <p className="font-semibold text-lg text-purple-300">
                          {locations.length} locations monitored
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Locations Display */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 overflow-x-auto">
                      {/* Desktop Table View */}
                      <div className="hidden md:block">
                        <table className="w-full text-white min-w-full">
                          <thead>
                            <tr className="border-b border-white/20">
                              <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">LOCATION</th>
                              <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">POOLS</th>
                              <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">OPERATORS</th>
                              <th className="text-left p-3 font-semibold text-sm whitespace-nowrap">ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {locations.map((location, index) => (
                              <tr key={index} className="border-b border-white/10">
                                <td className="p-3 text-sm whitespace-nowrap">{location.name}</td>
                                <td className="p-3 text-sm whitespace-nowrap">{location.pools}</td>
                                <td className="p-3 text-sm whitespace-nowrap">{location.operators}</td>
                                <td className="p-3">
                                  <button 
                                    onClick={() => handleView(location)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 whitespace-nowrap"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {locations.map((location, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-white font-semibold text-lg">{location.name}</h3>
                              <button 
                                onClick={() => handleView(location)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                              >
                                View
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-300 block">Pools</span>
                                <p className="text-white font-medium">{location.pools}</p>
                              </div>
                              <div>
                                <span className="text-gray-300 block">Operators</span>
                                <p className="text-white font-medium">{location.operators}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                    <div className="mb-6">
                      <h2 className="font-bold text-2xl lg:text-3xl text-white mb-2">Location Map</h2>
                      <p className="font-semibold text-lg text-teal-300">Interactive facility locations</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 h-64 md:h-80 lg:h-96">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.4927920574264!2d30.060151911394943!3d-1.956333898017703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42ba4412995%3A0xeb7a3b7e5681a72d!2sKigali%20Serena%20Hotel!5e0!3m2!1sen!2srw!4v1716978777948!5m2!1sen!2srw"
                        className="w-full h-full rounded-xl"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Section for All Roles */}
          <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Pools Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-cyan-300 text-lg font-semibold mb-2">Total Pools</h3>
                  <p className="text-white text-3xl font-bold">{pools.length}</p>
                  <p className="text-cyan-200 text-sm mt-2">Currently monitored</p>
                </div>
              </div>

              {/* Active Operators Card (Admin only) */}
              {userRole === "admin" && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <h3 className="text-blue-300 text-lg font-semibold mb-2">Active Operators</h3>
                    <p className="text-white text-3xl font-bold">{operators.length}</p>
                    <p className="text-blue-200 text-sm mt-2">Managing facilities</p>
                  </div>
                </div>
              )}

              {/* Locations Card (Overseer only) */}
              {userRole === "overseer" && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <h3 className="text-purple-300 text-lg font-semibold mb-2">Locations</h3>
                    <p className="text-white text-3xl font-bold">{locations.length}</p>
                    <p className="text-purple-200 text-sm mt-2">Under supervision</p>
                  </div>
                </div>
              )}

              {/* System Status Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <h3 className="text-green-300 text-lg font-semibold mb-2">System Status</h3>
                  <p className="text-white text-3xl font-bold">Online</p>
                  <p className="text-green-200 text-sm mt-2">All systems operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {poolEditModal.open && (
        <ModalPool
          data={poolEditModal.data}
          operators={operators}
          Fn={setPoolEditModal}
        />
      )}
      {poolDeleteModal.open && <ModalDeletePool Fn={setPoolDeleteModal} />}
      {locationModal.open && (
        <ModalLocation
          role={userRole}
          location={locationModal.id}
          Fn={setLocationModal}
        />
      )}
      {operatorDeleteModal.open && (
        <ModalDeleteOperator Fn={setOperatorDeleteModal} />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Custom scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb);
        }
        
        /* Horizontal scroll for tables */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #0891b2, #2563eb);
        }
        
        /* Ensure responsive behavior */
        table {
          min-width: 600px;
        }
        
        /* Prevent text overflow */
        .whitespace-nowrap {
          white-space: nowrap;
        }
        
        /* Ensure iframe responsiveness */
        iframe {
          max-width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};