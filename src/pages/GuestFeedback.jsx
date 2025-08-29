// =================== UPDATED GUEST FEEDBACK WITH PROPER POOLS INTEGRATION ===================
// src/pages/GuestFeedback.jsx - Updated to work with existing Redux structure
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FeedbackForm from '../components/FeedbackForm';
import { fetchMyFeedback, clearErrors } from '../redux/slices/feedbackSlice';
import { poolsAvailable } from '../redux/slices/poolsByLocationSlice'; // IMPORT YOUR EXISTING ACTION
import { toast } from 'react-toastify';

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
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

const GuestFeedback = () => {
  const dispatch = useDispatch();
  
  // Redux state - USE YOUR EXISTING STRUCTURE
  const { 
    myFeedback, 
    myFeedbackLoading, 
    myFeedbackError,
    submitLoading,
    submitError 
  } = useSelector((state) => state.feedback);

  // ACCESS POOLS FROM YOUR EXISTING SLICE STRUCTURE
  const { 
    response: pools, 
    loading: poolsLoading, 
    error: poolsError,
    serverResponded
  } = useSelector((state) => state.poolsByLocation);

  const user = useSelector((state) => state.user.user);
  
  // Local state
  const [activeTab, setActiveTab] = useState('list');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load feedback and pools data on component mount
  useEffect(() => {
    if (user?.role === 'guest') {
      dispatch(fetchMyFeedback());
      
      // FETCH POOLS USING YOUR EXISTING ACTION
      if (user?.location) {
        console.log('Fetching pools for user location:', user.location);
        dispatch(poolsAvailable(user.location));
      }
    }
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [dispatch, user]);

  // Debug authentication and user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token Debug:', {
      tokenExists: !!token,
      tokenLength: token?.length,
      tokenStart: token?.substring(0, 20) + '...',
      userFromRedux: user,
      userRole: user?.role,
      userLocation: user?.location
    });
  }, [user]);

  // Handle errors - INCLUDING POOLS ERROR
  useEffect(() => {
    if (myFeedbackError) {
      toast.error(myFeedbackError);
      dispatch(clearErrors());
    }
    if (submitError) {
      toast.error(submitError);
      dispatch(clearErrors());
    }
    if (poolsError) {
      toast.error('Failed to load pools for your location');
    }
  }, [myFeedbackError, submitError, poolsError, dispatch]);

  // In your GuestFeedback component, add this debug useEffect:
   useEffect(() => {
     console.log('🔍 Component Debug:', {
       myFeedback,
       myFeedbackType: typeof myFeedback,
       isArray: Array.isArray(myFeedback),
       length: myFeedback?.length,
       myFeedbackLoading,
       myFeedbackError,
       user: user?.id
     });
   }, [myFeedback, myFeedbackLoading, myFeedbackError]);

  // Manual refresh function - REFRESH BOTH FEEDBACK AND POOLS
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMyFeedback()).unwrap();
      
      // ALSO REFRESH POOLS
      if (user?.location) {
        dispatch(poolsAvailable(user.location));
      }
      
      toast.success('Data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate dynamic statistics from real data - HANDLE UNDEFINED STATE
  const feedbackArray = myFeedback || [];
  const feedbackStats = {
    totalFeedback: feedbackArray.length,
    pendingFeedback: feedbackArray.filter(f => ['submitted', 'under_review'].includes(f.status)).length,
    inProgressFeedback: feedbackArray.filter(f => f.status === 'in_progress').length,
    resolvedFeedback: feedbackArray.filter(f => f.status === 'resolved').length,
    averageRating: feedbackArray.length > 0 && feedbackArray.some(f => f.rating)
      ? (feedbackArray.filter(f => f.rating).reduce((acc, f) => acc + f.rating, 0) / feedbackArray.filter(f => f.rating).length).toFixed(1)
      : 'N/A'
  };

  // Get status display configuration
  const getStatusDisplay = (status) => {
    const statusMap = {
      submitted: { 
        color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', 
        icon: Clock, 
        label: 'Submitted' 
      },
      under_review: { 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', 
        icon: Eye, 
        label: 'Under Review' 
      },
      in_progress: { 
        color: 'bg-orange-500/20 text-orange-300 border-orange-400/30', 
        icon: RefreshCw, 
        label: 'In Progress' 
      },
      resolved: { 
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', 
        icon: CheckCircle, 
        label: 'Resolved' 
      },
      dismissed: { 
        color: 'bg-red-500/20 text-red-300 border-red-400/30', 
        icon: XCircle, 
        label: 'Dismissed' 
      }
    };
    return statusMap[status] || statusMap.submitted;
  };

  // Close modal and refresh data
  const handleModalClose = () => {
    setShowFeedbackModal(false);
    // Refresh feedback after a short delay
    setTimeout(() => {
      dispatch(fetchMyFeedback());
    }, 1000);
  };

  const tabs = [
    { id: 'list', label: 'My Feedback', icon: MessageSquare },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  const StatCard = ({ title, value, icon: Icon, color = "cyan", description }) => (
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
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
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

  // UPDATED FeedbackModal - PASS POOLS DATA TO FEEDBACKFORM
  const FeedbackModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <FeedbackForm 
            onClose={onClose} 
            pools={pools || []}
            poolsLoading={poolsLoading}
            poolsError={poolsError}
          />
        </div>
      </div>
    );
  };

  // Enhanced MyFeedbackComponent with real data
  const MyFeedbackComponent = () => (
    <div className="space-y-3 sm:space-y-4">
      {/* Loading State */}
      {myFeedbackLoading && (
        <div className="text-center py-8 sm:py-12">
          <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-white mb-2">Loading your feedback...</h3>
          <p className="text-sm sm:text-base text-gray-300">Please wait while we fetch your feedback history.</p>
        </div>
      )}

      {/* Error State */}
      {myFeedbackError && !myFeedbackLoading && (
        <div className="text-center py-8 sm:py-12">
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-white mb-2">Failed to load feedback</h3>
          <p className="text-sm sm:text-base text-gray-300 mb-4 px-4">{myFeedbackError}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-sm sm:text-base"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!myFeedbackLoading && !myFeedbackError && feedbackArray.length === 0 && (
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
      )}

      
      {/* Feedback List with Real Data */}
      {!myFeedbackLoading && !myFeedbackError && feedbackArray.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-all duration-200 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {feedbackArray.map((feedback) => {
            const statusDisplay = getStatusDisplay(feedback.status);
            const StatusIcon = statusDisplay.icon;
            
            return (
              <div
                key={feedback.id}
                className="relative group"
              >
                <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-lg sm:rounded-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 blur"></div>
                <div className="relative p-4 sm:p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg sm:rounded-xl hover:border-white/40 transition-all duration-300">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm sm:text-base mb-1 pr-2">
                        {feedback.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                        <span>Type: {feedback.feedbackType?.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Priority: {feedback.priority}</span>
                        {feedback.pool && (
                          <>
                            <span>•</span>
                            <span>Pool: {feedback.pool.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {feedback.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm text-gray-300">{feedback.rating}/5</span>
                        </div>
                      )}
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 whitespace-nowrap ${statusDisplay.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusDisplay.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-3 text-sm sm:text-base leading-relaxed">
                    {feedback.description}
                  </p>

                  {/* Admin Response */}
                  {feedback.adminResponse && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-300">Admin Response</span>
                        {feedback.responder && (
                          <span className="text-xs text-gray-400">
                            by {feedback.responder.fname} {feedback.responder.lname}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-emerald-200 leading-relaxed">
                        {feedback.adminResponse}
                      </p>
                      {feedback.respondedAt && (
                        <div className="text-xs text-emerald-400 mt-2">
                          Responded on {new Date(feedback.respondedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                    <div className="text-xs sm:text-sm text-gray-400">
                      Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                    </div>
                    {feedback.isAnonymous && (
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                        Anonymous
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
            description="All submissions"
          />
          <StatCard
            title="Pending Review"
            value={feedbackStats.pendingFeedback}
            icon={Clock}
            color="orange"
            description="Awaiting response"
          />
          <StatCard
            title="Resolved"
            value={feedbackStats.resolvedFeedback}
            icon={TrendingUp}
            color="emerald"
            description="Completed items"
          />
          <StatCard
            title="Average Rating"
            value={feedbackStats.averageRating}
            icon={Star}
            color="purple"
            description="Your ratings"
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

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group disabled:opacity-50"
              >
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300 flex-shrink-0">
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 text-purple-400 ${refreshing ? 'animate-spin' : ''}`} />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-white text-sm sm:text-base">Refresh Data</div>
                  <div className="text-xs sm:text-sm text-gray-300">Update feedback list</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Status Breakdown */}
      {feedbackArray.length > 0 && (
        <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-0.5 sm:-inset-1 lg:-inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl lg:rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-cyan-400" />
                Feedback Status Overview
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {['submitted', 'under_review', 'in_progress', 'resolved'].map((status) => {
                  const count = feedbackArray.filter(f => f.status === status).length;
                  const percentage = feedbackArray.length > 0 ? (count / feedbackArray.length) * 100 : 0;
                  const statusDisplay = getStatusDisplay(status);
                  
                  return (
                    <div key={status} className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm font-medium text-cyan-300 capitalize truncate flex items-center gap-2">
                            <statusDisplay.icon className="h-3 w-3" />
                            {statusDisplay.label}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-300 flex-shrink-0 ml-2">{count} items</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 border border-white/20">
                          <div
                            className="h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
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
              <p>• Use different feedback types to categorize your submissions</p>
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
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-2 sm:top-5 sm:left-5 lg:top-10 lg:left-10 xl:top-20 xl:left-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-4 right-2 sm:top-10 sm:right-5 lg:top-20 lg:right-10 xl:top-40 xl:right-20 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-2 left-4 sm:bottom-5 sm:left-10 lg:bottom-10 lg:left-20 xl:bottom-20 xl:left-40 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-96 xl:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content Container */}
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

          {/* New Feedback Button */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex justify-center mb-4 sm:mb-6">
              <button
                onClick={() => setShowFeedbackModal(true)}
                disabled={submitLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    New Feedback
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
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
                        {tab.id === 'list' && feedbackArray.length > 0 && (
                          <span className="bg-cyan-500/20 text-cyan-300 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-cyan-400/30 ml-1">
                            {feedbackArray.length}
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
            {activeTab === 'list' && <ListTab />}
            {activeTab === 'stats' && <StatsTab />}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleModalClose}
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