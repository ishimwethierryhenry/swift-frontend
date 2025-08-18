// =================== FIXED MY FEEDBACK COMPONENT ===================
// src/components/MyFeedback.jsx
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/feedback/my-feedback`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('API Response:', response.data); // Debug log

      // Handle different response structures
      let feedbackData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          feedbackData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          feedbackData = response.data.data;
        } else if (response.data.feedback && Array.isArray(response.data.feedback)) {
          feedbackData = response.data.feedback;
        } else {
          console.warn('Unexpected response structure:', response.data);
          feedbackData = [];
        }
      }

      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError(error.message || 'Failed to load your feedback');
      toast.error('Failed to load your feedback');
      setFeedback([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-yellow-400" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'under_review':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'in_progress':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'dismissed':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'text-gray-400';
      case 'medium':
        return 'text-blue-400';
      case 'high':
        return 'text-orange-400';
      case 'urgent':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        <p className="text-white/70 text-sm">Loading your feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <XCircle className="h-12 w-12 text-red-400" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Feedback</h3>
          <p className="text-white/70 text-sm mb-4">{error}</p>
          <button
            onClick={fetchMyFeedback}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-purple-400 h-5 w-5 sm:h-6 sm:w-6" />
          My Feedback History
        </h2>
        <div className="text-sm text-white/70">
          {Array.isArray(feedback) ? feedback.length : 0} feedback{(Array.isArray(feedback) ? feedback.length : 0) !== 1 ? 's' : ''} submitted
        </div>
      </div>

      {!Array.isArray(feedback) || feedback.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No feedback yet</h3>
          <p className="text-white/70">You haven't submitted any feedback. Share your thoughts to help us improve!</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id || `feedback-${Math.random()}`}
              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 sm:p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white text-sm sm:text-base">{item.title || 'Untitled Feedback'}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status || 'submitted')}`}>
                      {getStatusIcon(item.status || 'submitted')}
                      {(item.status || 'submitted').replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/70 mb-3">
                    <span className="capitalize">{(item.feedbackType || 'general').replace('_', ' ')}</span>
                    <span className={`capitalize font-medium ${getPriorityColor(item.priority || 'medium')}`}>
                      {item.priority || 'medium'} priority
                    </span>
                    {item.pool && item.pool.name && (
                      <span>Pool: {item.pool.name}</span>
                    )}
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{item.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-white/80 mb-3 text-sm sm:text-base leading-relaxed">{item.description || 'No description provided'}</p>
                  
                  {item.adminResponse && (
                    <div className="bg-blue-500/10 border-l-4 border-blue-400 p-3 mt-4 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-medium text-blue-300">Admin Response</div>
                        {item.responder && (
                          <div className="text-xs text-blue-400">
                            by {item.responder.fname} {item.responder.lname}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-blue-200">{item.adminResponse}</p>
                      {item.respondedAt && (
                        <div className="text-xs text-blue-400 mt-1">
                          {new Date(item.respondedAt).toLocaleDateString()} at {new Date(item.respondedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-white/50 pt-3 border-t border-white/10 gap-2">
                <span>
                  Submitted on {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'} 
                  {item.createdAt && ` at ${new Date(item.createdAt).toLocaleTimeString()}`}
                </span>
                {item.isAnonymous && (
                  <span className="bg-white/10 px-2 py-1 rounded text-white/70 self-start sm:self-auto">Anonymous</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFeedback;