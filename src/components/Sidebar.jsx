// UPDATED Sidebar.jsx - Added Settings Modal with 2FA Configuration
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MdDashboard, MdFeedback } from "react-icons/md";
import { LiaSwimmingPoolSolid } from "react-icons/lia";
import { GrUserManager } from "react-icons/gr";
import { BiSolidNetworkChart } from "react-icons/bi";
import { FaHistory } from "react-icons/fa";
import { IoMdWater } from "react-icons/io";
import { FiEye, FiSettings } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { activeLinksActions } from "../redux/slices/activeLinkSlice";
import { 
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Bell,
  Palette,
  Lock,
  X
} from "lucide-react";
import logo2 from "../assets/logo2.png";
import TwoFactorSetupModal from './auth/TwoFactorSetupModal'; // CORRECTED IMPORT PATH

// 2FA Disable Verification Modal Component
// Updated 2FA Disable Verification Modal - INTEGRATED WITH YOUR BACKEND
const TwoFactorDisableModal = ({ isOpen, onClose, onConfirm, userName }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleDisable2FA = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const API_BASE_URL = 'https://swift-backend-88o8.onrender.com';
      
      console.log('Attempting to disable 2FA...');
      
      const response = await fetch(`${API_BASE_URL}/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: verificationCode })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.status === 'success') {
          // Update local state
          localStorage.setItem(`2fa_enabled_${userName}`, 'false');
          localStorage.removeItem(`2fa_secret_${userName}`);
          localStorage.removeItem(`2fa_backup_codes_${userName}`);
          
          onConfirm();
          onClose();
          setVerificationCode('');
          alert(result.message || '2FA disabled successfully!');
        } else {
          throw new Error(result.message || 'Failed to disable 2FA');
        }
      } else {
        throw new Error(`Invalid verification number. Please check your authenticator app or if you think this is a mistake, kindly contact the support team!`);
        // throw new Error(`Server error: ${response.status}`);
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to disable 2FA. Please try again.');
    }

    setIsVerifying(false);
  };

  const handleClose = () => {
    setVerificationCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-md w-full border border-white/20 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Disable Two-Factor Authentication</h2>
              <p className="text-gray-300 text-sm">Security verification required</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-300 text-sm font-bold">!</span>
              </div>
              <div>
                <h4 className="text-red-300 font-semibold mb-1">Security Warning</h4>
                <p className="text-red-200 text-sm">
                  Disabling 2FA will make your account less secure. To confirm this action, 
                  please enter the current 6-digit code from your authenticator app.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Code Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Current Authenticator Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="000000"
                className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white text-center text-2xl font-mono tracking-widest placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-red-400 focus:bg-white/10"
                maxLength={6}
                autoFocus
              />
              <p className="text-gray-400 text-xs mt-2">
                Open your authenticator app and enter the current code for {userName}'s account.
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <X className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={handleClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 border border-white/20 hover:border-white/40"
            >
              Cancel
            </button>
            <button
              onClick={handleDisable2FA}
              disabled={isVerifying || verificationCode.length !== 6}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Disable 2FA'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose, userName, userRole }) => {
  const [activeTab, setActiveTab] = useState('security');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load user preferences from localStorage
      const saved2FA = localStorage.getItem(`2fa_enabled_${userName}`);
      setTwoFactorEnabled(saved2FA === 'true');
      
      const savedNotifications = localStorage.getItem(`notifications_${userName}`);
      setNotifications(savedNotifications !== 'false'); // Default to true
      
      const savedDarkMode = localStorage.getItem(`dark_mode_${userName}`);
      setDarkMode(savedDarkMode !== 'false'); // Default to true
    }
  }, [isOpen, userName]);

  const handleSave2FA = (enabled) => {
    if (enabled) {
      // Open the 2FA setup modal
      setShow2FASetup(true);
    } else {
      // Open the 2FA disable verification modal
      setShow2FADisable(true);
    }
  };

  const handleConfirmDisable2FA = () => {
    // Actually disable 2FA after verification
    setTwoFactorEnabled(false);
    localStorage.setItem(`2fa_enabled_${userName}`, 'false');
    
    // Also clear stored 2FA data
    localStorage.removeItem(`2fa_secret_${userName}`);
    localStorage.removeItem(`2fa_backup_codes_${userName}`);
    
    // Show success message
    alert('Two-Factor Authentication has been successfully disabled for your account.');
  };

  const handle2FASetupComplete = () => {
    setTwoFactorEnabled(true);
    localStorage.setItem(`2fa_enabled_${userName}`, 'true');
    setShow2FASetup(false);
  };

  const handleSaveNotifications = (enabled) => {
    setNotifications(enabled);
    localStorage.setItem(`notifications_${userName}`, enabled.toString());
  };

  const handleSaveDarkMode = (enabled) => {
    setDarkMode(enabled);
    localStorage.setItem(`dark_mode_${userName}`, enabled.toString());
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <FiSettings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Account Settings</h2>
                <p className="text-gray-300 text-sm">{userName} • {userRole}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-full max-h-[500px]">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-48 bg-white/5 p-4 border-r border-white/10">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                    
                    {/* 2FA Setting */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Lock className="h-5 w-5 text-green-400" />
                            <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                          </div>
                          <p className="text-gray-300 text-sm mb-4">
                            Add an extra layer of security to your account with 2FA using your mobile device.
                          </p>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              twoFactorEnabled 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSave2FA(!twoFactorEnabled)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                              twoFactorEnabled
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                            }`}
                          >
                            {twoFactorEnabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>

                      {/* 2FA Setup Modal */}
                      <TwoFactorSetupModal
                        isOpen={show2FASetup}
                        onClose={() => setShow2FASetup(false)}
                        onComplete={handle2FASetupComplete}
                        userName={userName}
                        userEmail={localStorage.getItem("user_email") || `${userName}@example.com`}
                      />

                      {/* 2FA Disable Verification Modal */}
                      <TwoFactorDisableModal
                        isOpen={show2FADisable}
                        onClose={() => setShow2FADisable(false)}
                        onConfirm={handleConfirmDisable2FA}
                        userName={userName}
                      />
                    </div>

                    {/* Password Change */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lock className="h-5 w-5 text-blue-400" />
                        <h4 className="font-medium text-white">Password</h4>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">
                        Update your password to keep your account secure.
                      </p>
                      <button className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all duration-200">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                    
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Bell className="h-5 w-5 text-yellow-400" />
                            <h4 className="font-medium text-white">Push Notifications</h4>
                          </div>
                          <p className="text-gray-300 text-sm">
                            Receive notifications about pool status, alerts, and system updates.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications}
                            onChange={(e) => handleSaveNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500"></div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white mb-2">Email Notifications</h4>
                          <p className="text-gray-300 text-sm">
                            Receive important updates and alerts via email.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Appearance Settings</h3>
                    
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Palette className="h-5 w-5 text-purple-400" />
                            <h4 className="font-medium text-white">Dark Mode</h4>
                          </div>
                          <p className="text-gray-300 text-sm">
                            Use dark theme for reduced eye strain and better battery life.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={(e) => handleSaveDarkMode(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500"></div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Theme Color</h4>
                        <p className="text-gray-300 text-sm mb-4">
                          Choose your preferred color scheme for the dashboard.
                        </p>
                        <div className="flex space-x-3">
                          <button className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-white/50"></button>
                          <button className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-transparent hover:border-white/30 transition-colors"></button>
                          <button className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-transparent hover:border-white/30 transition-colors"></button>
                          <button className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 border-2 border-transparent hover:border-white/30 transition-colors"></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              Close
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-200">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Swimming Pool Logo Component
const SwimmingPoolLogo = ({ size = 36 }) => (
  <div className="relative overflow-hidden rounded-lg">
    <img 
      src={logo2}
      alt="SWIFT Logo"
      className="w-full h-full object-cover rounded-lg"
      style={{ width: size, height: size }}
    />
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 rounded-lg"></div>
  </div>
);

export const SideNav = ({ label, destination, active = false, isCollapsed }) => {
  const dispatch = useDispatch();
  
  const getIcon = () => {
    const iconClass = `${active ? "text-white" : "text-gray-300"} transition-colors duration-300`;
    const size = 24;
    
    switch(label) {
      case "Overview":
      case "Dashboard":
        return <MdDashboard className={iconClass} size={size} />;
      case "Monitor":
        return <IoMdWater className={iconClass} size={size} />;
      case "Pools":
      case "View Pools":
        return <LiaSwimmingPoolSolid className={iconClass} size={size} />;
      case "Operators":
        return <GrUserManager className={iconClass} size={size} />;
      case "Prediction":
        return <BiSolidNetworkChart className={iconClass} size={size} />;
      case "History":
        return <FaHistory className={iconClass} size={size} />;
      case "Feedback":
        return <MdFeedback className={iconClass} size={size} />;
      default:
        return null;
    }
  };

  return (
    <Link
      to={destination}
      className={`group relative flex items-center w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 transform scale-105' 
          : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-102'
      }`}
      onClick={() => dispatch(activeLinksActions.setActiveLink(label))}
      title={isCollapsed ? label : undefined}
    >
      {active && (
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl lg:rounded-3xl opacity-30 blur-lg"></div>
      )}
      
      <div className={`relative flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3 lg:gap-4'}`}>
        {getIcon()}
        {!isCollapsed && (
          <span className={`font-semibold text-base lg:text-lg transition-colors duration-300 ${
            active ? 'text-white' : 'text-gray-300 group-hover:text-white'
          }`}>
            {label}
          </span>
        )}
      </div>
      
      <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 lg:h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full transition-all duration-300 ${
        active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
      }`}></div>
    </Link>
  );
};

export const Sidebar = () => {
  const activeLink = useSelector((state) => state.activeLinks.active);
  const userRole = localStorage.getItem("user_role");
  const userName = localStorage.getItem("user_name");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsCollapsed(isMobile);
    };

    handleResize();
    setIsVisible(true);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <div className="absolute top-10 lg:top-20 left-2 lg:left-4 w-16 lg:w-32 h-16 lg:h-32 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl lg:blur-2xl opacity-15 animate-pulse"></div>
          <div className="absolute bottom-10 lg:bottom-20 right-2 lg:right-4 w-12 lg:w-24 h-12 lg:h-24 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl lg:blur-2xl opacity-15 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-4 lg:left-8 w-8 lg:w-16 h-8 lg:h-16 bg-teal-300 rounded-full mix-blend-multiply filter blur-lg lg:blur-xl opacity-10 animate-pulse animation-delay-1000"></div>
        </div>

        <aside 
          className={`relative flex-shrink-0 h-full backdrop-blur-lg bg-slate-900/95 border-r border-white/10 shadow-2xl transition-all duration-500 z-50 ${
            isCollapsed ? 'w-16 lg:w-20' : 'w-64 lg:w-72'
          } ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex flex-col h-full relative z-10">
            
            <div className={`flex items-center justify-between p-3 lg:p-6 border-b border-white/10 transition-all duration-300 ${
              isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}>
              <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 rounded-xl lg:rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300 group-hover:scale-110"></div>
                    <div className="relative w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-300 shadow-2xl">
                      <SwimmingPoolLogo size={isCollapsed ? 24 : 36} />
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="transition-all duration-300">
                      <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent tracking-wide">
                        SWIFT
                      </h1>
                      <p className="text-xs lg:text-sm text-cyan-300 font-medium">
                        {userRole === "guest" ? "Guest Access" : "Enhancing Pool Water Quality"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                ) : (
                  <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                )}
              </button>
            </div>

            <nav className="flex-1 px-2 lg:px-4 py-4 lg:py-6 space-y-2 lg:space-y-3 overflow-y-auto">
              
              <div className={`transition-all duration-500 delay-200 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
                {userRole === "guest" ? (
                  <SideNav
                    label="Dashboard"
                    destination="/guest-dashboard"
                    active={activeLink === "Dashboard"}
                    isCollapsed={isCollapsed}
                  />
                ) : (
                  <SideNav
                    label="Overview"
                    destination="/dashboard"
                    active={activeLink === "Overview"}
                    isCollapsed={isCollapsed}
                  />
                )}
              </div>
              
              <div className={`transition-all duration-500 delay-250 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
                <SideNav
                  label="Monitor"
                  destination="/pool"
                  active={activeLink === "Monitor"}
                  isCollapsed={isCollapsed}
                />
              </div>
              
              {userRole === "admin" && (
                <div className={`transition-all duration-500 delay-300 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}>
                  <SideNav
                    label="Pools"
                    destination="/pool/create"
                    active={activeLink === "Pools"}
                    isCollapsed={isCollapsed}
                  />
                </div>
              )}

              {userRole === "guest" && (
                <div className={`transition-all duration-500 delay-350 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}>
                  <SideNav
                    label="Feedback"
                    destination="/feedback"
                    active={activeLink === "Feedback"}
                    isCollapsed={isCollapsed}
                  />
                </div>
              )}

              {userRole === "admin" && (
                <div className={`transition-all duration-500 delay-400 ${
                  isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}>
                  <SideNav
                    label="Operators"
                    destination="/operator/create"
                    active={activeLink === "Operators"}
                    isCollapsed={isCollapsed}
                  />
                </div>
              )}

              <div className={`transition-all duration-500 delay-500 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
                <SideNav
                  label="Prediction"
                  destination="/predict"
                  active={activeLink === "Prediction"}
                  isCollapsed={isCollapsed}
                />
              </div>

              <div className={`transition-all duration-500 delay-600 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
                <SideNav
                  label="History"
                  destination="/history"
                  active={activeLink === "History"}
                  isCollapsed={isCollapsed}
                />
              </div>
            </nav>

            {/* Updated User Section with Settings */}
            <div className={`border-t border-white/10 p-2 lg:p-4 transition-all duration-500 delay-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className={`relative flex items-center p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 w-full ${
                    isCollapsed ? 'justify-center' : 'space-x-2 lg:space-x-3'
                  } hover:bg-white/10 hover:scale-105`}
                >
                  <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                    <User className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs lg:text-sm font-semibold text-white truncate">
                          {userName || "User"}
                        </p>
                        <p className="text-xs text-gray-300 capitalize truncate">
                          {userRole === "guest" ? "Guest User" : userRole || "operator"}
                        </p>
                      </div>
                      <FiSettings className="h-4 w-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
                    </>
                  )}
                </button>
              </div>
              
              {isCollapsed && userName && (
                <div className="mt-1 lg:mt-2 text-center">
                  <span className="text-xs text-gray-300 block truncate">
                    {userName.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>

            {userRole === "guest" && !isCollapsed && (
              <div className="px-3 lg:px-4 pb-2 lg:pb-4">
                <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <FiEye className="text-gray-400" size={12} />
                    <p className="text-xs text-gray-300 font-medium">
                      Guest • Dashboard, Monitor, Feedback
                    </p>
                  </div>
                </div>
              </div>
            )}

            {userRole === "guest" && isCollapsed && (
              <div className="px-2 pb-2">
                <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-2 flex justify-center">
                  <FiEye className="text-gray-400" size={14} />
                </div>
              </div>
            )}
          </div>
        </aside>

        <style jsx>{`
          .animation-delay-1000 { animation-delay: 1s; }
          .animation-delay-2000 { animation-delay: 2s; }
          .hover\\:scale-102:hover { transform: scale(1.02); }
        `}</style>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userName={userName || "User"}
        userRole={userRole || "operator"}
      />
    </>
  );
};