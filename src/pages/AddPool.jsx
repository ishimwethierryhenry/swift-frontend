import { useEffect, useState } from "react";
import { operatorsAvailable } from "../redux/slices/operatorsByLocationSlice";
import { useDispatch, useSelector } from "react-redux";
import { poolSchema } from "../validation/poolSchema";
import { registerPool } from "../redux/slices/poolAddSlice";
import { activeLinksActions } from "../redux/slices/activeLinkSlice";
import { poolsAvailable } from "../redux/slices/poolsByLocationSlice";
import { deletePool } from "../redux/slices/deletePoolSlice";
import { ModalPool } from "../components/ModalPool"; // Import ModalPool component
import { ModalDeletePool } from "../components/ModalDeletePool"; // Import ModalDeletePool component

export const AddPool = () => {
  const dispatch = useDispatch();
  const userLocation = localStorage.getItem("user_location");
  const userRole = localStorage.getItem("user_role");
  const userId = localStorage.getItem("user_id");

  // Redux states
  const addOperatorsState = useSelector((state) => state.poolAdd || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });
  
  const operatorsAvailableState = useSelector((state) => state.operatorsByLocation || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });

  const poolsAvailableState = useSelector((state) => state.poolsByLocation || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });

  const deletePoolState = useSelector((state) => state.deletePool || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });

  // Component state
  const [operators, setOperators] = useState([]);
  const [allPools, setAllPools] = useState([]);
  const [filteredPools, setFilteredPools] = useState([]);
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("manage"); // Changed default to "manage" for Manage Pools first
  
  // Modal state
  const [editModalState, setEditModalState] = useState({
    open: false,
    data: null
  });
  
  const [deleteModalState, setDeleteModalState] = useState({
    open: false,
    data: null
  });
  
  // Pagination state - Changed from 10 to 5
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Form state
  const initialFormState = {
    name: "",
    location: "",
    l: "",
    w: "",
    depth: "",
    assigned_to: "",
  };
  
  const [submitData, setSubmitData] = useState(initialFormState);

  // Form handlers
  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      if (validateForm(submitData)) {
        dispatch(registerPool(submitData));
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
      [e.target.name]: e.target.value,
    }));
  };

  // Pool management handlers
  const handleDeletePool = (pool) => {
    setDeleteModalState({
      open: true,
      data: pool
    });
  };

  const handleEditPool = (pool) => {
    setEditModalState({
      open: true,
      data: pool
    });
  };

  const handleConfirmDelete = (poolId) => {
    dispatch(deletePool(poolId));
    // Close the delete modal
    setDeleteModalState({ open: false, data: null });
  };

  // Helper function to get operator name by ID
  const getOperatorNameById = (operatorId) => {
    const operator = operators.find(op => op.id === operatorId);
    return operator ? `${operator.fname} ${operator.lname}` : operatorId;
  };

  // Search and filter functions
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilter = (location) => {
    setFilterLocation(location);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allPools];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(pool =>
        pool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (filterLocation) {
      filtered = filtered.filter(pool => pool.location === filterLocation);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      
      if (sortOrder === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

    setFilteredPools(filtered);
  }, [allPools, searchTerm, filterLocation, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPools = filteredPools.slice(startIndex, endIndex);

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(allPools.map(pool => pool.location).filter(Boolean))];

  // Report generation functions
  const generateCSVReport = () => {
    const headers = ["Name", "Location", "Length (m)", "Width (m)", "Depth (m)", "Assigned To"];
    const csvContent = [
      headers.join(","),
      ...filteredPools.map(pool => [
        pool.name || "",
        pool.location || "",
        pool.l || "",
        pool.w || "",
        pool.depth || "",
        getOperatorNameById(pool.assigned_to) || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pools_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateXLSReport = () => {
    // For XLS generation, we'll create a simple tab-separated format
    const headers = ["Name", "Location", "Length (m)", "Width (m)", "Depth (m)", "Assigned To"];
    const xlsContent = [
      headers.join("\t"),
      ...filteredPools.map(pool => [
        pool.name || "",
        pool.location || "",
        pool.l || "",
        pool.w || "",
        pool.depth || "",
        getOperatorNameById(pool.assigned_to) || ""
      ].join("\t"))
    ].join("\n");

    const blob = new Blob([xlsContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pools_report_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  const generatePDFReport = () => {
    // For PDF generation, we'll create a simple HTML structure and use print
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pools Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .header-info { text-align: center; margin-bottom: 20px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>Swimming Pools Report</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Pools: ${filteredPools.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Length (m)</th>
                <th>Width (m)</th>
                <th>Depth (m)</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPools.map(pool => `
                <tr>
                  <td>${pool.name || 'N/A'}</td>
                  <td>${pool.location || 'N/A'}</td>
                  <td>${pool.l || 'N/A'}</td>
                  <td>${pool.w || 'N/A'}</td>
                  <td>${pool.depth || 'N/A'}</td>
                  <td>${getOperatorNameById(pool.assigned_to) || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // UseEffect hooks
  useEffect(() => {
    if (addOperatorsState?.serverResponded && !addOperatorsState?.loading && !addOperatorsState?.error) {
      setSubmitData(initialFormState);
      setErrors({});
      // Refresh pools list after adding a new pool
      if (userRole === "admin" || userRole === "operator") {
        dispatch(poolsAvailable(userLocation));
      }
    }
  }, [addOperatorsState?.serverResponded, addOperatorsState?.loading, addOperatorsState?.error]);

  useEffect(() => {
    if (operatorsAvailableState?.serverResponded && operatorsAvailableState?.response) {
      setOperators(operatorsAvailableState.response);
    }
  }, [operatorsAvailableState?.serverResponded, operatorsAvailableState?.response]);

  useEffect(() => {
    if (poolsAvailableState?.serverResponded && poolsAvailableState?.response) {
      setAllPools(poolsAvailableState.response);
    }
  }, [poolsAvailableState?.serverResponded, poolsAvailableState?.response]);

  // Handle successful pool deletion
  useEffect(() => {
    if (deletePoolState?.serverResponded && !deletePoolState?.loading && !deletePoolState?.error) {
      // Refresh pools list after successful deletion
      dispatch(poolsAvailable(userLocation));
      // Close delete modal
      setDeleteModalState({ open: false, data: null });
    }
  }, [deletePoolState?.serverResponded, deletePoolState?.loading, deletePoolState?.error]);

  useEffect(() => {
    dispatch(operatorsAvailable(userLocation));
    dispatch(poolsAvailable(userLocation));
    dispatch(activeLinksActions.setActiveLink("Pools"));
    setIsVisible(true);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-10 sm:top-40 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 sm:bottom-20 sm:left-40 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Water Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-300 rounded-full opacity-30 animate-bounce`}
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + i * 8}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 md:pb-24">
        <div className="flex justify-center items-start min-h-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-7xl mx-auto pb-16 sm:pb-20">
          <div className={`w-full transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            
            {/* Title Section */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="overflow-hidden">
                <label className={`font-bold text-3xl sm:text-4xl md:text-5xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                  Pool Management System
                </label>
              </div>
              <div className="overflow-hidden">
                <label className={`font-bold text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                  Add new pools and manage existing ones
                </label>
              </div>
              <div className="w-24 sm:w-28 md:w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-4 sm:mt-6"></div>
            </div>

            {/* Tab Navigation - Swapped order */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-1 border border-white/20">
                <button
                  onClick={() => setActiveTab("manage")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === "manage"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Manage Pools ({allPools.length})
                </button>
                <button
                  onClick={() => setActiveTab("add")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === "add"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Add New Pool
                </button>
              </div>
            </div>

            {/* Manage Pools Section - Now first */}
            {activeTab === "manage" && (
              <div className="space-y-6">
                {/* Search and Filter Controls */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="flex-1">
                      <label className="block text-white font-semibold mb-2">Search Pools</label>
                      <input
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                      />
                    </div>

                    {/* Filter by Location */}
                    <div className="flex-1">
                      <label className="block text-white font-semibold mb-2">Filter by Location</label>
                      <select
                        value={filterLocation}
                        onChange={(e) => handleFilter(e.target.value)}
                        className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                      >
                        <option value="" className="bg-slate-800">All Locations</option>
                        {uniqueLocations.map((location) => (
                          <option key={location} value={location} className="bg-slate-800">
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div className="flex-1">
                      <label className="block text-white font-semibold mb-2">Sort By</label>
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split('-');
                          setSortBy(field);
                          setSortOrder(order);
                        }}
                        className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                      >
                        <option value="name-asc" className="bg-slate-800">Name (A-Z)</option>
                        <option value="name-desc" className="bg-slate-800">Name (Z-A)</option>
                        <option value="location-asc" className="bg-slate-800">Location (A-Z)</option>
                        <option value="location-desc" className="bg-slate-800">Location (Z-A)</option>
                        <option value="depth-asc" className="bg-slate-800">Depth (Shallow to Deep)</option>
                        <option value="depth-desc" className="bg-slate-800">Depth (Deep to Shallow)</option>
                      </select>
                    </div>
                  </div>

                  {/* Report Generation Buttons with Font Awesome Icons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={generateCSVReport}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fas fa-file-csv"></i> Export CSV
                    </button>
                    <button
                      onClick={generateXLSReport}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fas fa-file-excel"></i> Export XLS
                    </button>
                    <button
                      onClick={generatePDFReport}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fas fa-file-pdf"></i> Export PDF
                    </button>
                    <div className="ml-auto text-white/70 text-sm flex items-center">
                      Showing {currentPools.length} of {filteredPools.length} pools
                    </div>
                  </div>
                </div>

                {/* Pools Table */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-white">
                      <thead className="bg-white/5">
                        <tr>
                          <th 
                            className="text-left p-4 font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => handleSort('name')}
                          >
                            NAME {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className="text-left p-4 font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => handleSort('location')}
                          >
                            LOCATION {sortBy === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className="text-left p-4 font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => handleSort('l')}
                          >
                            LENGTH (m) {sortBy === 'l' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className="text-left p-4 font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => handleSort('w')}
                          >
                            WIDTH (m) {sortBy === 'w' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className="text-left p-4 font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => handleSort('depth')}
                          >
                            DEPTH (m) {sortBy === 'depth' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="text-left p-4 font-semibold">ASSIGNED TO</th>
                          <th className="text-left p-4 font-semibold">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPools.length > 0 ? (
                          currentPools.map((pool, index) => (
                            <tr key={pool.id || index} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium">{pool.name || 'N/A'}</td>
                              <td className="p-4">{pool.location || 'N/A'}</td>
                              <td className="p-4">{pool.l || 'N/A'}</td>
                              <td className="p-4">{pool.w || 'N/A'}</td>
                              <td className="p-4">{pool.depth || 'N/A'}</td>
                              <td className="p-4">{getOperatorNameById(pool.assigned_to) || 'Unassigned'}</td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleEditPool(pool)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePool(pool)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-white/70">
                              {searchTerm || filterLocation ? 'No pools match your search criteria.' : 'No pools found. Add your first pool!'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/Tablet Card View */}
                  <div className="lg:hidden p-4 space-y-4">
                    {currentPools.length > 0 ? (
                      currentPools.map((pool, index) => (
                        <div key={pool.id || index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-semibold text-lg">{pool.name || 'N/A'}</h3>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditPool(pool)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeletePool(pool)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-300">Location:</span>
                              <p className="text-white font-medium">{pool.location || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-300">Assigned To:</span>
                              <p className="text-white font-medium">{getOperatorNameById(pool.assigned_to) || 'Unassigned'}</p>
                            </div>
                            <div>
                              <span className="text-gray-300">Dimensions:</span>
                              <p className="text-white font-medium">{pool.l || 'N/A'}m × {pool.w || 'N/A'}m</p>
                            </div>
                            <div>
                              <span className="text-gray-300">Depth:</span>
                              <p className="text-white font-medium">{pool.depth || 'N/A'}m</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-white/70">
                        {searchTerm || filterLocation ? 'No pools match your search criteria.' : 'No pools found. Add your first pool!'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 3 ||
                          page === currentPage + 3
                        ) {
                          return (
                            <span key={page} className="px-3 py-2 text-white/50">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Add Pool Form */}
            {activeTab === "add" && (
              <div className={`relative group transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} max-w-4xl mx-auto`}>
                <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                  
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                    
                    {/* Pool Name - Full Width */}
                    <div className={`transition-all duration-700 delay-1100 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Pool Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.name}
                        placeholder="Enter pool name"
                      />
                      {errors.name && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.name}</span>
                      )}
                    </div>

                    {/* Location - Full Width */}
                    <div className={`transition-all duration-700 delay-1200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Location</label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.location}
                        placeholder="Olympic Hotel"
                      />
                      {errors.location && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.location}</span>
                      )}
                    </div>

                    {/* Dimensions Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                      
                      {/* Length */}
                      <div className={`transition-all duration-700 delay-1300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <label className="block text-white font-semibold mb-2 text-sm sm:text-base">Length (m)</label>
                        <input
                          type="text"
                          name="l"
                          id="l"
                          onChange={handleInput}
                          className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                          value={submitData.l}
                          placeholder="e.g. 25"
                        />
                        {errors.l && (
                          <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.l}</span>
                        )}
                      </div>

                      {/* Width */}
                      <div className={`transition-all duration-700 delay-1400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <label className="block text-white font-semibold mb-2 text-sm sm:text-base">Width (m)</label>
                        <input
                          type="text"
                          name="w"
                          id="w"
                          onChange={handleInput}
                          className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                          value={submitData.w}
                          placeholder="e.g. 12"
                        />
                        {errors.w && (
                          <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.w}</span>
                        )}
                      </div>

                      {/* Depth */}
                      <div className={`transition-all duration-700 delay-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} sm:col-span-2 lg:col-span-1`}>
                        <label className="block text-white font-semibold mb-2 text-sm sm:text-base">Depth (m)</label>
                        <input
                          type="text"
                          name="depth"
                          id="depth"
                          onChange={handleInput}
                          className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                          value={submitData.depth}
                          placeholder="e.g. 1.5"
                        />
                        {errors.depth && (
                          <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.depth}</span>
                        )}
                      </div>
                    </div>

                    {/* Assign Operator - Full Width */}
                    <div className={`transition-all duration-700 delay-1600 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                      <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Assign to Operator</label>
                      <select
                        name="assigned_to"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        id="assigned_to"
                        value={submitData.assigned_to}
                      >
                        <option value="" className="bg-slate-800 text-white">Select an operator</option>
                        {operators.map((operator) => (
                          <option key={operator.id} value={operator.id} className="bg-slate-800 text-white">
                            {operator.fname} {operator.lname}
                          </option>
                        ))}
                      </select>
                      <p className="text-gray-300 text-xs sm:text-sm mt-2">
                        Only registered operators are available in the list
                      </p>
                      {errors.assigned_to && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.assigned_to}</span>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className={`flex justify-center pt-4 sm:pt-6 transition-all duration-1000 delay-1700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <button
                        type="submit"
                        disabled={addOperatorsState.loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white text-lg sm:text-xl font-semibold px-8 sm:px-12 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-cyan-500/50 group relative overflow-hidden disabled:cursor-not-allowed disabled:transform-none min-h-[48px]"
                      >
                        <span className="relative z-10">
                          {addOperatorsState?.loading ? 'Adding Pool...' : 'Add Pool'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Edit */}
      {editModalState.open && editModalState.data && (
        <ModalPool
          Fn={setEditModalState}
          data={editModalState.data}
          operators={operators}
        />
      )}

      {/* Modal for Delete */}
      {deleteModalState.open && deleteModalState.data && (
        <ModalDeletePool
          Fn={setDeleteModalState}
          data={deleteModalState.data}
          onConfirmDelete={handleConfirmDelete}
          loading={deletePoolState?.loading}
        />
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Ensure select dropdown visibility on mobile */
        select option {
          background-color: #1e293b;
          color: white;
        }
        
        /* Touch-friendly form elements */
        @media (max-width: 768px) {
          input, select, button {
            min-height: 44px;
          }
        }

        /* Custom scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
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
          height: 4px;
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
      `}</style>
    </div>
  );
};