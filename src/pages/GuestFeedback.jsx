// =================== FULLY RESPONSIVE HARMONIZED GUEST FEEDBACK ===================
// src/pages/GuestFeedback.jsx - Matching GuestDashboard.jsx design colors with full responsiveness
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare,
  Plus,
  Star,
  Clock,
  TrendingUp,
  Eye,
  BarChart3,
  Send,
  ArrowLeft,
  Users,
  X
} from 'lucide-react';

const GuestFeedback = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Mock user data - replace with actual user context/props
  const user = { fname: 'Guest User' };
  
  // Mock feedback data - replace with actual data fetching
  const [myFeedback] = useState([
    {
      id: 1,
      title: 'Pool temperature sensor issue',
      description: 'The temperature reading seems inconsistent in Pool A.',
      status: 'pending',
      rating: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Dashboard loading slowly',
      description: 'The dashboard takes a long time to load the charts.',
      status: 'in_progress',
      rating: 3,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      title: 'Great user interface',
      description: 'Love the new design updates. Very intuitive!',
      status: 'resolved',
      rating: 5,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Feedback statistics
  const feedbackStats = {
    totalFeedback: myFeedback.length,
    pendingFeedback: myFeedback.filter(f => f.status === 'pending').length,
    resolvedFeedback: myFeedback.filter(f => f.status === 'resolved').length,
    averageRating: myFeedback.length > 0 
      ? (myFeedback.reduce((acc, f) => acc + (f.rating || 0), 0) / myFeedback.length).toFixed(1)
      : 0
  };

  const tabs = [
    { id: 'list', label: 'My Feedback', icon: MessageSquare },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
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

  const FeedbackModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
        <div className="relative group w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-30 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Submit New Feedback</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-300 hover:text-white transition-colors duration-300 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Feedback title" 
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base" 
              />
              <textarea 
                placeholder="Describe your feedback in detail..." 
                rows={4}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 resize-none text-sm sm:text-base"
              />
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors duration-300" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={onClose}
                  className="w-full sm:flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={onClose}
                  className="w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Send className="h-4 w-4" />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MyFeedbackComponent = () => (
    <div className="space-y-3 sm:space-y-4">
      {myFeedback.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="p-3 sm:p-4 bg-white/10 rounded-full w-fit mx-auto mb-4">
            <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-cyan-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-white mb-2">No feedback yet</h3>
          <p className="text-sm sm:text-base text-gray-300 mb-4 px-4">You haven't submitted any feedback. Share your thoughts to help us improve!</p>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            Submit First Feedback
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {myFeedback.map((feedback) => (
            <div
              key={feedback.id}
              className="relative group"
            >
              <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 blur"></div>
              <div className="relative p-4 sm:p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg sm:rounded-xl hover:border-white/40 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h4 className="font-semibold text-white text-sm sm:text-base pr-2">{feedback.title}</h4>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {feedback.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                        <span className="text-xs sm:text-sm text-gray-300">{feedback.rating}/5</span>
                      </div>
                    )}
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                      feedback.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                      feedback.status === 'in_progress' ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' :
                      'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    }`}>
                      {feedback.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-3 text-sm sm:text-base leading-relaxed">{feedback.description}</p>
                <div className="text-xs sm:text-sm text-gray-400">
                  Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const StatsTab = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2">
              Your Feedback Impact, {user?.fname}! 📊
            </h2>
            <p className="text-purple-200 text-sm sm:text-base lg:text-lg">
              Track your feedback contributions and see how your insights help improve the system.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
          <StatCard
            title="Total Feedback"
            value={feedbackStats.totalFeedback}
            icon={MessageSquare}
            color="cyan"
          />
          <StatCard
            title="Pending Review"
            value={feedbackStats.pendingFeedback}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Resolved"
            value={feedbackStats.resolvedFeedback}
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            title="Average Rating"
            value={feedbackStats.averageRating}
            icon={Star}
            color="purple"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="flex items-center gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors duration-300 flex-shrink-0">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-white text-sm sm:text-base">New Feedback</div>
                  <div className="text-xs sm:text-sm text-gray-300">Share new insights</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className="flex items-center gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors duration-300 flex-shrink-0">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-white text-sm sm:text-base">View All Feedback</div>
                  <div className="text-xs sm:text-sm text-gray-300">Browse history</div>
                </div>
              </button>

              <a
                href="/dashboard"
                className="flex items-center gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300 flex-shrink-0">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-white text-sm sm:text-base">Dashboard</div>
                  <div className="text-xs sm:text-sm text-gray-300">Return to overview</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Status Breakdown */}
      {myFeedback.length > 0 && (
        <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-cyan-400" />
                Feedback Status Overview
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {['pending', 'in_progress', 'resolved'].map((status) => {
                  const count = myFeedback.filter(f => f.status === status).length;
                  const percentage = myFeedback.length > 0 ? (count / myFeedback.length) * 100 : 0;
                  const statusColors = {
                    pending: 'bg-blue-500',
                    in_progress: 'bg-orange-500',
                    resolved: 'bg-emerald-500'
                  };
                  
                  return (
                    <div key={status} className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm font-medium text-cyan-300 capitalize truncate">
                            {status.replace('_', ' ')}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-300 flex-shrink-0 ml-2">{count} items</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 border border-white/20">
                          <div
                            className={`h-1.5 sm:h-2 rounded-full ${statusColors[status]} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Tips */}
      <div className={`transition-all duration-1000 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3">💡 Feedback Tips</h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm lg:text-base text-cyan-200">
              <p>• Be specific and detailed in your feedback descriptions</p>
              <p>• Include steps to reproduce any issues you encounter</p>
              <p>• Rate your experience to help us prioritize improvements</p>
              <p>• Check back regularly to see responses from our team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ListTab = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2">
              Your Feedback History 📝
            </h2>
            <p className="text-blue-200 text-sm sm:text-base lg:text-lg">
              Track all your submitted feedback and responses from our team.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <MyFeedbackComponent />
          </div>
        </div>
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

      {/* Main Content Container - Fully Scrollable */}
      <div className="relative z-10 content-wrapper">
        <div className="p-2 sm:p-3 lg:p-4 xl:p-6 2xl:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* Header */}
            <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-white mb-2 lg:mb-4">
                  Feedback Center
                </h1>
                <p className="text-cyan-300 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold mb-3 sm:mb-4">
                  Share your thoughts and track responses
                </p>
                <div className="w-12 sm:w-16 lg:w-20 xl:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
              </div>
            </div>

            {/* Header with Feedback Button */}
            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                <div className="hidden lg:block"></div>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm lg:text-base"
                >
                  <Plus className="h-4 w-4" />
                  New Feedback
                </button>
              </div>

              {/* Mobile/Tablet Feedback Button */}
              <div className="lg:hidden mb-4 sm:mb-6">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 sm:py-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4" />
                  New Feedback
                </button>
              </div>
            </div>

            {/* Tabs - Fully Responsive */}
            <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative group mb-4 sm:mb-6 lg:mb-8">
                <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg sm:rounded-xl opacity-20 blur"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-1 border border-white/20">
                  <nav className="flex space-x-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-none justify-center sm:justify-start ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline sm:inline">{tab.label}</span>
                          <span className="xs:hidden sm:hidden">{tab.id === 'list' ? 'List' : 'Stats'}</span>
                          {tab.id === 'list' && myFeedback.length > 0 && (
                            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-cyan-400/30 ml-1">
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

            {/* Tab Content - Responsive with Proper Spacing */}
            <div className="tab-content">
              {activeTab === 'list' && <ListTab />}
              {activeTab === 'stats' && <StatsTab />}
            </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

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
        
        /* Smart TV optimizations */
        @media (min-width: 2560px) {
          .tv-optimized {
            font-size: 1.5rem;
            line-height: 1.8;
          }
        }
        
        /* Ensure proper viewport handling and scrolling */
        html, body {
          overflow-x: hidden;
          scroll-behavior: smooth;
          height: 100%;
        }
        
        /* Main container scrolling fix */
        .main-container {
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        /* Content spacing fixes */
        .content-wrapper {
          min-height: 100vh;
          padding-bottom: 10rem;
        }
        
        /* Fix for mobile viewport height issues */
        @supports (-webkit-touch-callout: none) {
          .main-container {
            height: -webkit-fill-available;
          }
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
      `}</style>
    </div>
  );
};

export default GuestFeedback;