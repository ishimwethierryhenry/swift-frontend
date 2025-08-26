import { useDispatch, useSelector } from "react-redux";
import { registerOperator } from "../redux/slices/operatorAddSlice";
import { operatorsAvailable } from "../redux/slices/operatorsByLocationSlice";
import { deleteOperator, resetDeleteOperatorState } from "../redux/slices/deleteOperatorSlice";
import { userSchema } from "../validation/userSchema";
import { useEffect, useState } from "react";
import { activeLinksActions } from "../redux/slices/activeLinkSlice";
import { ModalOperator } from "../components/ModalOperator";
import { ModalDeleteOperator } from "../components/ModalDeleteOperator";

export const AddOperators = () => {
  const dispatch = useDispatch();
  const userLocation = localStorage.getItem("user_location");
  
  // Redux state
  const addOperatorsState = useSelector((state) => state.operatorAdd || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
    success: false,
    status: null
  });

  const operatorsAvailableState = useSelector((state) => state.operatorsByLocation || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });

  const deleteOperatorState = useSelector((state) => state.deleteOperator || {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  });

  // Component state
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Operators management state
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("fname");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Pagination settings
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOperators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOperators = filteredOperators.slice(startIndex, endIndex);

  // Modal states
  const [operatorEditModal, setOperatorEditModal] = useState({
    id: null,
    open: false,
    data: null,
  });
  const [operatorDeleteModal, setOperatorDeleteModal] = useState({
    id: null,
    open: false,
    data: null,
  });
  
  // Form state
  const initialFormState = {
    fname: "",
    lname: "",
    location: "",
    email: "",
    phone: "",
    gender: "",
  };
  
  const [submitData, setSubmitData] = useState(initialFormState);

  // Handle form submission
  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      
      console.log("Submitting form data:", submitData);

      if (validateForm(submitData)) {
        dispatch(registerOperator(submitData));
      }
    } catch (error) {
      console.log("Form submission error:", error);
    }
  };

  // Form validation
  const validateForm = (data) => {
    const { error } = userSchema.validate(data, { abortEarly: false });
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

  // Handle input changes
  const handleInput = (e) => {
    e.preventDefault();

    setSubmitData((prevState) => ({
      ...prevState,
      fname: e.target.name === "fname" ? e.target.value : prevState.fname,
      lname: e.target.name === "lname" ? e.target.value : prevState.lname,
      email: e.target.name === "email" ? e.target.value : prevState.email,
      location: e.target.name === "location" ? e.target.value : prevState.location,
      phone: e.target.name === "phone" ? e.target.value : prevState.phone,
      gender: e.target.name === "gender" ? e.target.value : prevState.gender,
    }));
  };

  // Search and filter functionality
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilter = (filter) => {
    setFilterBy(filter);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Apply search, filter, and sort
  useEffect(() => {
    let filtered = [...operators];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(operator =>
        operator.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operator.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter
    if (filterBy !== "all") {
      filtered = filtered.filter(operator => {
        switch (filterBy) {
          case "male":
            return operator.gender?.toLowerCase() === "male";
          case "female":
            return operator.gender?.toLowerCase() === "female";
          case "location":
            return operator.location?.toLowerCase() === userLocation?.toLowerCase();
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || "";
      let bVal = b[sortBy] || "";
      
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredOperators(filtered);
  }, [operators, searchTerm, filterBy, sortBy, sortOrder, userLocation]);

  // Export to CSV - exactly like Pool Management
  const exportToCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Location", "Gender"];
    const csvContent = [
      headers.join(","),
      ...filteredOperators.map(operator => [
        operator.fname || "",
        operator.lname || "",
        operator.email || "",
        operator.phone || "",
        operator.location || "",
        operator.gender || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `operators_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export to XLS - exactly like Pool Management
  const exportToXLS = () => {
    // For XLS generation, we'll create a simple tab-separated format
    const headers = ["First Name", "Last Name", "Email", "Phone", "Location", "Gender"];
    const xlsContent = [
      headers.join("\t"),
      ...filteredOperators.map(operator => [
        operator.fname || "",
        operator.lname || "",
        operator.email || "",
        operator.phone || "",
        operator.location || "",
        operator.gender || ""
      ].join("\t"))
    ].join("\n");

    const blob = new Blob([xlsContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `operators_report_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
  };

  // Export to PDF - Stunning and innovative design
  // Replace the entire exportToPDF function in your AddOperators component with this updated version:

const exportToPDF = () => {
  // For PDF generation, we'll create a stunning HTML structure with modern design
  const printWindow = window.open('', '_blank');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Pool Operators Report - SWIFT</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            min-height: 100vh; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            display: flex; 
            flex-direction: column;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            background: linear-gradient(135deg, #00bcd4, #2196f3); 
            color: white; 
            padding: 30px; 
            border-radius: 20px; 
            box-shadow: 0 20px 40px rgba(0, 188, 212, 0.3);
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.15), transparent);
            animation: shimmer 3s infinite;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          
          .logo-container { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin-bottom: 20px; 
            position: relative;
            z-index: 10;
          }
          
          .logo-frame { 
            position: relative; 
            width: 100px; 
            height: 100px; 
            background: linear-gradient(135deg, #00bcd4, #2196f3); 
            border-radius: 25px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 15px 35px rgba(0,188,212,0.4); 
            margin-right: 20px;
            border: 3px solid rgba(255,255,255,0.3);
          }
          
          .logo-img { 
            width: 75px; 
            height: 75px; 
            object-fit: cover; 
            border-radius: 18px;
            filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));
          }
          
          .logo-overlay { 
            position: absolute; 
            inset: 10px; 
            background: linear-gradient(135deg, rgba(0, 188, 212, 0.2), rgba(33, 150, 243, 0.2)); 
            border-radius: 15px; 
          }
          
          .app-name { 
            color: white; 
            font-size: 48px; 
            font-weight: 900; 
            margin: 0; 
            text-shadow: 0 5px 15px rgba(0,0,0,0.2);
            letter-spacing: 3px;
          }
          
          .app-tagline { 
            color: rgba(255,255,255,0.9); 
            font-size: 20px; 
            margin: 8px 0 0; 
            font-weight: 300;
            letter-spacing: 1px;
          }
          
          .content { 
            flex: 1; 
            background: white; 
            border-radius: 20px; 
            padding: 40px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
          }
          
          .report-title { 
            text-align: center;
            color: #1e40af; 
            font-size: 42px; 
            font-weight: 800; 
            margin: 0 0 30px; 
            background: linear-gradient(135deg, #00bcd4, #2196f3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 5px 15px rgba(0, 188, 212, 0.2);
            position: relative;
          }
          
          .report-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 250px;
            height: 4px;
            background: linear-gradient(135deg, #00bcd4, #2196f3);
            border-radius: 2px;
            box-shadow: 0 3px 10px rgba(0, 188, 212, 0.3);
          }
          
          .header-info { 
            text-align: center; 
            margin-bottom: 40px; 
            padding: 25px; 
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            border-radius: 15px;
            border-left: 6px solid #00bcd4;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          
          .info-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            border-top: 3px solid #00bcd4;
          }
          
          .info-label {
            color: #6b7280;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          .info-value {
            color: #1f2937;
            font-size: 18px;
            font-weight: 700;
          }
          
          .table-container {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 0;
            font-size: 14px;
          }
          
          th { 
            background: linear-gradient(135deg, #00acc1, #1976d2); 
            color: white; 
            padding: 20px 15px; 
            font-weight: 700; 
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 12px;
            border: none;
            position: relative;
          }
          
          th:first-child { border-top-left-radius: 0; }
          th:last-child { border-top-right-radius: 0; }
          
          td { 
            padding: 18px 15px; 
            border-bottom: 1px solid #f1f5f9;
            color: #374151;
            font-weight: 500;
            transition: background-color 0.3s ease;
          }
          
          tr:nth-child(even) td { 
            background: linear-gradient(135deg, #f8fafc, #f1f5f9); 
          }
          
          tr:hover td {
            background: linear-gradient(135deg, #e0f2fe, #e1f5fe);
            transform: scale(1.001);
          }
          
          .operator-name {
            font-weight: 700;
            color: #1e40af;
          }
          
          .operator-email {
            background: linear-gradient(135deg, #00bcd4, #2196f3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
          }
          
          .location-badge {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }
          
          .gender-tag {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .footer { 
            margin-top: auto; 
            padding-top: 40px; 
            text-align: center; 
            background: linear-gradient(135deg, #1e293b, #334155);
            color: white;
            margin: 40px -20px -20px -20px;
            padding: 30px 20px;
            position: relative;
          }
          
          .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #00bcd4, #2196f3);
          }
          
          .footer p {
            margin: 8px 0;
            font-size: 14px;
            opacity: 0.9;
          }
          
          .footer p:first-child {
            font-weight: 600;
            font-size: 16px;
          }
          
          @media print { 
            body { 
              background: white;
              min-height: 100vh; 
            }
            .footer { 
              position: fixed; 
              bottom: 0; 
              left: 0; 
              right: 0; 
              margin: 0;
              padding: 20px;
            }
            .content { 
              padding-bottom: 100px; 
            }
          }
          
          @media (max-width: 768px) {
            .info-grid { grid-template-columns: 1fr; }
            .app-name { font-size: 36px; }
            .report-title { font-size: 32px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <div class="logo-frame">
              <img src="/src/assets/logo2.png" alt="SWIFT Logo" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="logo-overlay"></div>
              <div style="display: none; color: #2196f3; font-size: 36px; font-weight: bold; align-items: center; justify-content: center; position: absolute; inset: 0;">S</div>
            </div>
            <div>
              <div class="app-name">SWIFT</div>
              <div class="app-tagline">Enhancing Pool Water Quality</div>
            </div>
          </div>
        </div>
        
        <div class="content">
          <h1 class="report-title">Pool Operators Report</h1>
          
          <div class="header-info">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Generated On</div>
                <div class="info-value">${new Date().toLocaleDateString()}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 3px;">${new Date().toLocaleTimeString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Total Operators</div>
                <div class="info-value">${filteredOperators.length}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Location</div>
                <div class="info-value">${localStorage.getItem('user_location') || 'All Locations'}</div>
              </div>
            </div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>👤 First Name</th>
                  <th>👥 Last Name</th>
                  <th>📧 Email</th>
                  <th>📱 Phone</th>
                  <th>📍 Location</th>
                  <th>⚧ Gender</th>
                </tr>
              </thead>
              <tbody>
                ${filteredOperators.map((operator, index) => `
                  <tr>
                    <td class="operator-name">${operator.fname || 'N/A'}</td>
                    <td class="operator-name">${operator.lname || 'N/A'}</td>
                    <td class="operator-email">${operator.email || 'N/A'}</td>
                    <td>${operator.phone || 'N/A'}</td>
                    <td><span class="location-badge">${operator.location || 'N/A'}</span></td>
                    <td><span class="gender-tag">${operator.gender || 'N/A'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p>This report was generated by SWIFT - Enhancing Pool Water Quality Management System</p>
          <p>© ${new Date().getFullYear()} SWIFT. All rights reserved. | Smart Water Intelligence and Forecasting Technology</p>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};

  // Modal handlers
  const handleViewOperator = (operator) => {
    setOperatorEditModal({ 
      id: operator.id || operator._id, 
      open: true, 
      data: { ...operator, mode: 'view' }
    });
  };
  
  const handleEditOperator = (operator) => {
    setOperatorEditModal({ 
      id: operator.id || operator._id, 
      open: true, 
      data: { ...operator, mode: 'edit' }
    });
  };
  
  const handleDeleteOperator = (operator) => {
    setOperatorDeleteModal({ 
      id: operator.id || operator._id, 
      open: true, 
      data: operator 
    });
  };

  const confirmDeleteOperator = async (operatorId) => {
    try {
      console.log("Deleting operator with ID:", operatorId);
      dispatch(deleteOperator(operatorId));
      setOperatorDeleteModal({ id: null, open: false, data: null });
    } catch (error) {
      console.error("Failed to delete operator:", error);
    }
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  };

  // Effects
  useEffect(() => {
    console.log("AddOperators state changed:", addOperatorsState);
    
    const isSuccess = 
      addOperatorsState.success ||
      addOperatorsState.isSuccess ||
      addOperatorsState.status === 'fulfilled' ||
      addOperatorsState.status === 'success' ||
      (addOperatorsState.response && !addOperatorsState.loading);

    const isNotLoading = !addOperatorsState.loading;

    if (isSuccess && isNotLoading) {
      console.log("🎉 Registration successful! Clearing form...");
      
      setSubmitData(initialFormState);
      setErrors({});
      setShowSuccessMessage(true);
      setShowAddForm(false);
      
      // Refresh operators list
      if (userLocation) {
        dispatch(operatorsAvailable(userLocation));
      }
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  }, [
    addOperatorsState.success,
    addOperatorsState.isSuccess, 
    addOperatorsState.status,
    addOperatorsState.loading,
    addOperatorsState.response
  ]);

  useEffect(() => {
    if (deleteOperatorState?.serverResponded && deleteOperatorState?.response) {
      if (userLocation) {
        dispatch(operatorsAvailable(userLocation));
      }
      dispatch(resetDeleteOperatorState());
    }
  }, [deleteOperatorState?.serverResponded, deleteOperatorState?.response, userLocation, dispatch]);

  useEffect(() => {
    if (operatorsAvailableState.serverResponded) {
      setOperators(operatorsAvailableState.response || []);
    }
  }, [operatorsAvailableState.serverResponded]);

  useEffect(() => {
    dispatch(activeLinksActions.setActiveLink("Operators"));
    setIsVisible(true);
    
    // Load operators on component mount
    if (userLocation) {
      dispatch(operatorsAvailable(userLocation));
    }
  }, [dispatch, userLocation]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-10 sm:top-40 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 sm:bottom-20 sm:left-40 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <span className="font-semibold">Pool Operator registered successfully! 🎉</span>
          </div>
        </div>
      )}

      {/* Scrollable Content Container */}
      <div className="relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-16 sm:pb-20 md:pb-24">
        <div className="flex justify-center items-start min-h-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-7xl mx-auto pb-16 sm:pb-20">
          <div className={`w-full transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="overflow-hidden">
                <label className={`font-bold text-3xl sm:text-4xl md:text-5xl text-white block transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                  Pool Operators Management
                </label>
              </div>
              <div className="overflow-hidden">
                <label className={`font-bold text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 block mt-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                  Complete operator management system
                </label>
              </div>
              <div className="w-24 sm:w-28 md:w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-4 sm:mt-6"></div>
            </div>

            {/* Control Panel */}
            <div className={`relative group mb-8 transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20">
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    {showAddForm ? 'Hide Add Form' : 'Add New Operator'}
                  </button>
                  
                  <div className="flex flex-wrap gap-2 sm:ml-auto">
                    <button
                      onClick={exportToCSV}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fas fa-file-csv"></i>
                      CSV
                    </button>
                    <button
                      onClick={exportToXLS}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fas fa-file-excel"></i>
                      Export XLS
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <i className="fas fa-file-pdf"></i>
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Search Operators</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full h-11 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                      placeholder="Search by name, email, phone..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">Filter By</label>
                    <select
                      value={filterBy}
                      onChange={(e) => handleFilter(e.target.value)}
                      className="w-full h-11 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                    >
                      <option value="all" className="bg-slate-800 text-white">All Operators</option>
                      <option value="male" className="bg-slate-800 text-white">Male</option>
                      <option value="female" className="bg-slate-800 text-white">Female</option>
                      <option value="location" className="bg-slate-800 text-white">Same Location</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSort(e.target.value)}
                      className="w-full h-11 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
                    >
                      <option value="fname" className="bg-slate-800 text-white">First Name</option>
                      <option value="lname" className="bg-slate-800 text-white">Last Name</option>
                      <option value="email" className="bg-slate-800 text-white">Email</option>
                      <option value="location" className="bg-slate-800 text-white">Location</option>
                    </select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <p className="text-cyan-300 font-semibold">
                    Showing {Math.min(startIndex + 1, filteredOperators.length)} - {Math.min(endIndex, filteredOperators.length)} of {filteredOperators.length} operators
                  </p>
                  <p className="text-white/70 text-sm mt-2 sm:mt-0">
                    Sort: {sortBy} ({sortOrder})
                    {searchTerm && ` • Search: "${searchTerm}"`}
                    {filterBy !== "all" && ` • Filter: ${filterBy}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Add Operator Form */}
            {showAddForm && (
              <div className={`relative group mb-8 transition-all duration-500 ${showAddForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20">
                  
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <i className="fas fa-user-plus text-emerald-400"></i>
                    Add New Pool Operator
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                    
                    {/* Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                      <div>
                        <label className="block text-white font-semibold mb-2 text-base sm:text-lg">First Name</label>
                        <input
                          type="text"
                          name="fname"
                          id="fname"
                          onChange={handleInput}
                          className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                          value={submitData.fname}
                          placeholder="Enter first name"
                        />
                        {errors.fname && (
                          <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.fname}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Last Name</label>
                        <input
                          type="text"
                          name="lname"
                          id="lname"
                          onChange={handleInput}
                          className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                          value={submitData.lname}
                          placeholder="Enter last name"
                        />
                        {errors.lname && (
                          <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.lname}</span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Email Address</label>
                      <input
                        type="text"
                        name="email"
                        id="email"
                        onChange={handleInput}
                        className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                        value={submitData.email}
                        placeholder="email@gmail.com"
                      />
                      {errors.email && (
                        <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.email}</span>
                      )}
                    </div>

                    {/* Phone and Gender Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                      <div>
                        <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          onChange={handleInput}
                          className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                          value={submitData.phone}
                          placeholder="+250 788 123 456"
                        />
                        {errors.phone && (
                          <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.phone}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2 text-base sm:text-lg">Gender</label>
                        <select
                          name="gender"
                          onChange={handleInput}
                          className="w-full h-11 sm:h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
                          id="gender"
                          value={submitData.gender}
                        >
                          <option value="" className="bg-slate-800 text-white">Select gender</option>
                          <option value="Male" className="bg-slate-800 text-white">Male</option>
                          <option value="Female" className="bg-slate-800 text-white">Female</option>
                          <option value="Other" className="bg-slate-800 text-white">Prefer Not to Say</option>
                        </select>
                        {errors.gender && (
                          <span className="text-red-400 text-xs sm:text-sm mt-1 block">{errors.gender}</span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
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

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 sm:pt-6">
                      <button
                        type="submit"
                        disabled={addOperatorsState.loading}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-600 text-white text-lg font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-emerald-500/50 group relative overflow-hidden disabled:cursor-not-allowed disabled:transform-none min-h-[48px] flex items-center gap-2"
                      >
                        <i className="fas fa-plus"></i>
                        <span className="relative z-10">
                          {addOperatorsState.loading ? 'Adding Operator...' : 'Add Operator'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* Operators Table */}
            <div className={`relative group transition-all duration-1000 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
              <div className="relative backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20">
                
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <i className="fas fa-users text-indigo-400"></i>
                  Pool Operators List
                </h3>

                {operatorsAvailableState.loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    <span className="ml-3 text-white">Loading operators...</span>
                  </div>
                ) : filteredOperators.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4"><i className="fas fa-users text-indigo-400"></i></div>
                    <p className="text-white/70 text-lg mb-4">
                      {searchTerm || filterBy !== "all" ? "No operators found matching your criteria" : "No operators registered yet"}
                    </p>
                    {!searchTerm && filterBy === "all" && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                      >
                        Add Your First Operator
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-white">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-semibold text-sm cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('fname')}>
                              FIRST NAME {sortBy === 'fname' && <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>}
                            </th>
                            <th className="text-left p-3 font-semibold text-sm cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('lname')}>
                              LAST NAME {sortBy === 'lname' && <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>}
                            </th>
                            <th className="text-left p-3 font-semibold text-sm">PHONE NUMBER</th>
                            <th className="text-left p-3 font-semibold text-sm cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('email')}>
                              EMAIL {sortBy === 'email' && <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>}
                            </th>
                            <th className="text-left p-3 font-semibold text-sm cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleSort('location')}>
                              LOCATION {sortBy === 'location' && <i className={`fas fa-chevron-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>}
                            </th>
                            <th className="text-left p-3 font-semibold text-sm">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentOperators.map((operator, index) => (
                            <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="p-3 text-sm">{operator.fname || 'N/A'}</td>
                              <td className="p-3 text-sm">{operator.lname || 'N/A'}</td>
                              <td className="p-3 text-sm">{operator.phone || 'N/A'}</td>
                              <td className="p-3 text-sm">{operator.email || 'N/A'}</td>
                              <td className="p-3 text-sm">{operator.location || 'N/A'}</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleViewOperator(operator)}
                                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                                    title="View Details"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  <button 
                                    onClick={() => handleEditOperator(operator)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
                                    title="Edit Operator"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteOperator(operator)}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                                    title="Delete Operator"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile/Tablet Cards */}
                    <div className="lg:hidden space-y-3 sm:space-y-4">
                      {currentOperators.map((operator, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-white font-semibold text-base sm:text-lg">
                              {operator.fname || 'N/A'} {operator.lname || ''}
                            </h4>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleViewOperator(operator)}
                                className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
                                title="View"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                onClick={() => handleEditOperator(operator)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                onClick={() => handleDeleteOperator(operator)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Phone:</span>
                              <span className="text-white">{operator.phone || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                              <span className="text-gray-300">Email:</span>
                              <span className="text-white break-all text-right">{operator.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Location:</span>
                              <span className="text-white">{operator.location || 'N/A'}</span>
                            </div>
                            {operator.gender && (
                              <div className="flex justify-between">
                                <span className="text-gray-300">Gender:</span>
                                <span className="text-white">{operator.gender}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                        <div className="text-white/70 text-sm">
                          Page {currentPage} of {totalPages} ({filteredOperators.length} total operators)
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <i className="fas fa-angle-double-left"></i>
                          </button>
                          
                          <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <i className="fas fa-angle-left"></i>
                          </button>
                          
                          {getPaginationRange().map(pageNum => (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`px-3 py-2 border rounded-lg transition-colors ${
                                pageNum === currentPage
                                  ? 'bg-cyan-500 border-cyan-400 text-white'
                                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <i className="fas fa-angle-right"></i>
                          </button>
                          
                          <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <i className="fas fa-angle-double-right"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {operatorEditModal.open && (
        <ModalOperator
          data={operatorEditModal.data}
          Fn={setOperatorEditModal}
          mode={operatorEditModal.data?.mode || 'edit'}
        />
      )}
      
      {operatorDeleteModal.open && (
        <ModalDeleteOperator 
          Fn={setOperatorDeleteModal}
          data={operatorDeleteModal.data}
          onConfirmDelete={confirmDeleteOperator}
          loading={deleteOperatorState?.loading || false}
        />
      )}

      {/* Custom Styles */}
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