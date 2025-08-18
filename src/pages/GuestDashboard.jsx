// =================== FIXED GUEST DASHBOARD WITH SAFE LENGTH ACCESS ===================
// src/pages/GuestDashboard.jsx - Fixed version with proper null checks
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Droplets, 
  TrendingUp, 
  Clock,
  MessageSquare,
  Plus,
  Eye,
  BarChart3,
  Star
} from 'lucide-react';
import FeedbackButton from '../components/FeedbackButton';
import MyFeedback from '../components/MyFeedback';
import { fetchMyFeedback } from '../redux/slices/feedbackSlice';

export const GuestDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user?.user);
  
  // ✅ FIXED: Safe access to feedback state with proper fallbacks
  const feedbackState = useSelector(state => state.feedback) || {};
  const { 
    myFeedback = [], // ✅ Default to empty array
    myFeedbackLoading = false,
    myFeedbackError = null
  } = feedbackState;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch user's feedback when component mounts
    if (user?.role === 'guest') {
      dispatch(fetchMyFeedback());
    }
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [dispatch, user]);

  // ✅ FIXED: Safe access to myFeedback.length with fallback
  const dashboardStats = {
    totalPools: 3,
    accessibleLocations: 1,
    lastVisit: new Date().toLocaleDateString(),
    feedbackSubmitted: myFeedback?.length || 0 // ✅ Safe access with fallback
  };

  // ✅ FIXED: Safe slicing with proper checks
  const recentFeedback = Array.isArray(myFeedback) ? myFeedback.slice(0, 3) : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'feedback', label: 'My Feedback', icon: MessageSquare },
  ];

  const StatCard = ({ title, value, icon: Icon, color = "cyan" }) => (
    <div className="relative group">
      <div className={`absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r ${
        color === 'cyan' ? 'from-cyan-500 to-blue-500' :
        color === 'emerald' ? 'from-emerald-500 to-teal-500' :
        color === 'purple' ? 'from-purple-500 to-pink-500' :
        'from-orange-500 to-yellow-500'
      } rounded-lg sm:rounded-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur`}></div>
      <div className="relative bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className={`text-xs sm:text-sm font-medium truncate ${
              color === 'cyan' ? 'text-cyan-300' :
              color === 'emerald' ? 'text-emerald-300' :
              color === 'purple' ? 'text-purple-300' :
              'text-orange-300'
            }`}>{title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">{value}</p>
          </div>
          <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ml-2 ${
            color === 'cyan' ? 'bg-cyan-500/20' :
            color === 'emerald' ? 'bg-emerald-500/20' :
            color === 'purple' ? 'bg-purple-500/20' :
            'bg-orange-500/20'
          }`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${
              color === 'cyan' ? 'text-cyan-400' :
              color === 'emerald' ? 'text-emerald-400' :
              color === 'purple' ? 'text-purple-400' :
              'text-orange-400'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 px-1 xs:px-2 sm:px-0">
      {/* Welcome Section */}
      <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-1 xs:mb-2">
              Welcome back, {user?.fname || 'Guest'}! 👋
            </h2>
            <p className="text-cyan-200 text-xs xs:text-sm sm:text-base lg:text-lg">
              You have guest access to monitor pool data and share feedback. Explore the system and let us know your thoughts!
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
          <StatCard
            title="Accessible Pools"
            value={dashboardStats.totalPools}
            icon={Droplets}
            color="cyan"
          />
          <StatCard
            title="Locations"
            value={dashboardStats.accessibleLocations}
            icon={Users}
            color="emerald"
          />
          <StatCard
            title="Feedback Submitted"
            value={dashboardStats.feedbackSubmitted}
            icon={MessageSquare}
            color="purple"
          />
          <StatCard
            title="Last Visit"
            value={dashboardStats.lastVisit}
            icon={Clock}
            color="orange"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h3 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 xs:mb-4 flex items-center gap-1 xs:gap-2">
              <TrendingUp className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-blue-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/feedback')}
                className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="p-1.5 xs:p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors duration-300 flex-shrink-0">
                  <Plus className="h-3 w-3 xs:h-4 xs:w-4 text-blue-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-white text-xs xs:text-sm sm:text-base">Submit Feedback</div>
                  <div className="text-xs sm:text-sm text-gray-300">Share your insights</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="p-1.5 xs:p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors duration-300 flex-shrink-0">
                  <Eye className="h-3 w-3 xs:h-4 xs:w-4 text-emerald-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-white text-xs xs:text-sm sm:text-base">View My Feedback</div>
                  <div className="text-xs sm:text-sm text-gray-300">Track responses</div>
                </div>
              </button>

              <a
                href="/pool"
                className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="p-1.5 xs:p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300 flex-shrink-0">
                  <Droplets className="h-3 w-3 xs:h-4 xs:w-4 text-purple-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-white text-xs xs:text-sm sm:text-base">Monitor Pools</div>
                  <div className="text-xs sm:text-sm text-gray-300">View real-time data</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback - Only show if there's feedback */}
      {recentFeedback.length > 0 && (
        <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <h3 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-1 xs:gap-2">
                  <MessageSquare className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-purple-400" />
                  Recent Feedback
                </h3>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className="text-xs xs:text-sm text-purple-300 hover:text-purple-200 font-medium transition-colors duration-300"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2 xs:space-y-3">
                {recentFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-2 xs:p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-1 xs:mb-2 gap-1 xs:gap-2">
                      <h4 className="font-medium text-white text-xs xs:text-sm sm:text-base pr-1">{feedback.title}</h4>
                      <div className="flex items-center gap-1 xs:gap-2 flex-shrink-0">
                        {feedback.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-300">{feedback.rating}</span>
                          </div>
                        )}
                        <span className={`px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                          feedback.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                          feedback.status === 'in_progress' ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' :
                          'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        }`}>
                          {feedback.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs xs:text-sm text-gray-300 line-clamp-2 leading-relaxed">{feedback.description}</p>
                    <div className="text-xs text-gray-400 mt-1 xs:mt-2">
                      {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'Unknown date'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Tips */}
      <div className={`transition-all duration-1000 delay-1100 guest-tips-container ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-2 xs:mb-3">💡 Guest Tips</h3>
            <div className="space-y-1 xs:space-y-1.5 sm:space-y-2 text-xs xs:text-sm sm:text-base text-cyan-200">
              <p>• Use the <strong className="text-white">Monitor</strong> section to view real-time pool water quality data</p>
              <p>• Check <strong className="text-white">History</strong> to see trends and historical measurements</p>
              <p>• Submit feedback about your experience or suggestions for improvement</p>
              <p>• Use <strong className="text-white">Predict</strong> to see future water quality predictions</p>
            </div>
          </div>
        </div>
        {/* Extra bottom spacing to match feedback page */}
        <div className="h-16 sm:h-20 lg:h-24"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative main-container">
      {/* Animated Background Elements - Responsive */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-2 sm:top-5 sm:left-5 lg:top-10 lg:left-10 xl:top-20 xl:left-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-4 right-2 sm:top-10 sm:right-5 lg:top-20 lg:right-10 xl:top-40 xl:right-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-2 left-4 sm:bottom-5 sm:left-10 lg:bottom-10 lg:left-20 xl:bottom-20 xl:left-40 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content Container - Mobile Optimized */}
      <div className="relative z-10 content-wrapper">
        <div className="p-1 xs:p-2 sm:p-3 lg:p-4 xl:p-6 2xl:p-8 max-w-7xl mx-auto space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
          
          {/* Dashboard Header */}
          <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="text-center mb-2 xs:mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
              <h1 className="font-bold text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-white mb-1 xs:mb-2 lg:mb-4">
                Guest Dashboard
              </h1>
              <p className="text-cyan-300 text-xs xs:text-sm sm:text-base lg:text-lg xl:text-xl font-semibold mb-2 xs:mb-3 sm:mb-4 px-2">
                Monitor pools and share your feedback
              </p>
              <div className="w-8 xs:w-12 sm:w-16 lg:w-20 xl:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Header with Feedback Button */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
              <div className="hidden sm:block"></div>
              <FeedbackButton className="hidden sm:flex" />
            </div>

            {/* Mobile Feedback Button */}
            <div className="sm:hidden mb-2 xs:mb-3 sm:mb-4 px-1 xs:px-2">
              <FeedbackButton className="w-full justify-center text-sm xs:text-base" />
            </div>
          </div>

          {/* Tabs - Fully Responsive */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative group mb-2 xs:mb-3 sm:mb-4 lg:mb-6 xl:mb-8 mx-1 xs:mx-2 sm:mx-0">
              <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg sm:rounded-xl opacity-20 blur"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-0.5 xs:p-1 border border-white/20">
                <nav className="flex space-x-0.5 xs:space-x-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1 xs:gap-1.5 sm:gap-2 px-1.5 xs:px-2 sm:px-3 lg:px-4 py-1.5 xs:py-2 sm:py-3 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-none justify-center sm:justify-start ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">{tab.label}</span>
                        <span className="xs:hidden">{tab.id === 'overview' ? 'Overview' : 'Feedback'}</span>
                        {tab.id === 'feedback' && myFeedback?.length > 0 && (
                          <span className="bg-cyan-500/20 text-cyan-300 text-xs font-medium px-1 xs:px-1.5 sm:px-2 py-0.5 rounded-full border border-cyan-400/30 ml-0.5 xs:ml-1">
                            {myFeedback.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'feedback' && (
              <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="relative group px-1 xs:px-2 sm:px-0">
                  <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <MyFeedback />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Responsive Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Enhanced scrollbar styling for all devices */
        * {
          scrollbar-width: thin;
          scrollbar-color: #06b6d4 rgba(255, 255, 255, 0.1);
        }
        
        *::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        *::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb);
        }
        
        /* Main container scrolling fix */
        .main-container {
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        /* Content spacing fixes - MATCH FEEDBACK PAGE EXACTLY */
        .content-wrapper {
          min-height: 100vh;
          padding-bottom: 20rem;
        }
        
        @media (max-width: 640px) {
          .content-wrapper {
            padding-bottom: 16rem;
          }
        }
        
        @media (max-width: 375px) {
          .content-wrapper {
            padding-bottom: 12rem;
          }
        }
        
        /* Fix for mobile viewport height issues */
        @supports (-webkit-touch-callout: none) {
          .main-container {
            height: -webkit-fill-available;
          }
        }
        
        /* Responsive breakpoints */
        @media (min-width: 475px) {
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
        }
        
        /* Touch-friendly buttons for all devices */
        @media (max-width: 1024px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* Optimize for tablets */
        @media (min-width: 768px) and (max-width: 1024px) {
          .tablet-optimized {
            font-size: 1rem;
            padding: 1rem;
          }
        }
        
        /* Large screen optimizations */
        @media (min-width: 1536px) {
          .container {
            max-width: 1400px;
          }
        }
        
        /* Ultra-wide screen support */
        @media (min-width: 1920px) {
          .ultra-wide-spacing {
            padding: 2rem 4rem;
          }
        }
        
        /* Ensure proper viewport handling and scrolling */
        html, body {
          overflow-x: hidden;
          scroll-behavior: smooth;
          height: 100%;
        }
        
        /* Fix iOS safe areas */
        @supports (padding: max(0px)) {
          .safe-area-padding {
            padding-left: max(0.5rem, env(safe-area-inset-left));
            padding-right: max(0.5rem, env(safe-area-inset-right));
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          }
        }
        
        /* High DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .high-dpi-text {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
        
        /* Prevent horizontal overflow on small screens */
        .overflow-guard {
          max-width: 100vw;
          overflow-x: hidden;
        }
        
        /* Improved focus states for accessibility */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #06b6d4;
          outline-offset: 2px;
        }
        
        /* Smooth scrolling for all elements */
        * {
          scroll-behavior: smooth;
        }
        
        /* Optimize animations for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Ensure Guest Tips are never cut off - INCREASED MARGINS */
        .guest-tips-container {
          margin-bottom: 4rem;
        }
        
        @media (max-width: 640px) {
          .guest-tips-container {
            margin-bottom: 3rem;
          }
        }
        
        @media (max-width: 375px) {
          .guest-tips-container {
            margin-bottom: 2.5rem;
          }
        }
        
        /* Additional mobile optimizations */
        @media (max-width: 375px) {
          .text-responsive {
            font-size: 0.75rem;
            line-height: 1.2;
          }
          
          .padding-mobile {
            padding: 0.5rem;
          }
        }
        
        /* Ensure all content is visible on very small screens - INCREASED PADDING */
        @media (max-height: 600px) {
          .content-wrapper {
            padding-bottom: 6rem;
          }
        }
        
        @media (max-height: 500px) {
          .content-wrapper {
            padding-bottom: 5rem;
          }
        }
        
        /* Additional bottom spacing for landscape mode */
        @media (orientation: landscape) and (max-height: 500px) {
          .content-wrapper {
            padding-bottom: 4rem;
          }
        }
        
        /* Ultra-mobile optimizations for very small phones */
        @media (max-width: 320px) {
          .ultra-mobile {
            font-size: 0.7rem;
            padding: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GuestDashboard;