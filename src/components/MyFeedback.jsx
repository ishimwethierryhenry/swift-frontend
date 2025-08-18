// =================== MY FEEDBACK COMPONENT ===================
// src/components/MyFeedback.jsx
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/feedback/my-feedback`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setFeedback(response.data.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load your feedback');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'text-gray-600';
      case 'medium':
        return 'text-blue-600';
      case 'high':
        return 'text-orange-600';
      case 'urgent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-blue-500" />
          My Feedback History
        </h2>
        <div className="text-sm text-gray-600">
          {feedback.length} feedback{feedback.length !== 1 ? 's' : ''} submitted
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
          <p className="text-gray-600">You haven't submitted any feedback. Share your thoughts to help us improve!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="capitalize">{item.feedbackType.replace('_', ' ')}</span>
                    <span className={`capitalize font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority} priority
                    </span>
                    {item.pool && (
                      <span>Pool: {item.pool.name}</span>
                    )}
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{item.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{item.description}</p>
                  
                  {item.adminResponse && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-medium text-blue-800">Admin Response</div>
                        {item.responder && (
                          <div className="text-xs text-blue-600">
                            by {item.responder.fname} {item.responder.lname}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-blue-700">{item.adminResponse}</p>
                      {item.respondedAt && (
                        <div className="text-xs text-blue-600 mt-1">
                          {new Date(item.respondedAt).toLocaleDateString()} at {new Date(item.respondedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                <span>
                  Submitted on {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                </span>
                {item.isAnonymous && (
                  <span className="bg-gray-100 px-2 py-1 rounded">Anonymous</span>
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