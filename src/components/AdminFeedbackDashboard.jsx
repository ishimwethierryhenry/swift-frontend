// =================== ADMIN FEEDBACK DASHBOARD ===================
// src/components/AdminFeedbackDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Filter,
  Search,
  Star,
  Eye,
  XCircle
} from 'lucide-react';
import { 
  fetchAllFeedback, 
  fetchFeedbackStats, 
  setFilters 
} from '../redux/slices/feedbackSlice';
import FeedbackResponseModal from './FeedbackResponseModal';
import FeedbackStatsCards from './FeedbackStatsCards';

const AdminFeedbackDashboard = () => {
  const dispatch = useDispatch();
  const { 
    allFeedback, 
    allFeedbackLoading, 
    feedbackStats, 
    statsLoading, 
    filters,
    feedbackPagination 
  } = useSelector(state => state.feedback);

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchAllFeedback(filters));
    dispatch(fetchFeedbackStats('month'));
  }, [dispatch]);

  useEffect(() => {
    // Refetch when filters change
    const filterParams = {
      ...filters,
      limit: 50,
      offset: 0
    };
    dispatch(fetchAllFeedback(filterParams));
  }, [filters, dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredFeedback = allFeedback.filter(feedback =>
    feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.guest?.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.guest?.lname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
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
        return 'text-gray-600 bg-gray-100';
      case 'medium':
        return 'text-blue-600 bg-blue-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'urgent':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRespondToFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowResponseModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-blue-500" />
          Guest Feedback Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredFeedback.length} of {feedbackPagination.total} feedback items
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <FeedbackStatsCards stats={feedbackStats} loading={statsLoading} />

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search feedback by title, description, or guest name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.feedbackType}
                  onChange={(e) => handleFilterChange('feedbackType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="issue">Issue</option>
                  <option value="compliment">Compliment</option>
                  <option value="feature_request">Feature Request</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt-DESC">Newest First</option>
                  <option value="createdAt-ASC">Oldest First</option>
                  <option value="priority-DESC">Priority (High to Low)</option>
                  <option value="rating-DESC">Rating (High to Low)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {allFeedbackLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No feedback matches your search criteria.' : 'No feedback has been submitted yet.'}
            </p>
          </div>
        ) : (
          filteredFeedback.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{feedback.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {getStatusIcon(feedback.status)}
                      {feedback.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                      {feedback.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="capitalize">{feedback.feedbackType.replace('_', ' ')}</span>
                    {!feedback.isAnonymous && feedback.guest && (
                      <span>by {feedback.guest.fname} {feedback.guest.lname}</span>
                    )}
                    {feedback.isAnonymous && <span className="italic">Anonymous</span>}
                    {feedback.pool && (
                      <span>Pool: {feedback.pool.name}</span>
                    )}
                    {feedback.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{feedback.rating}/5</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3">{feedback.description}</p>

                  {feedback.adminResponse && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-medium text-green-800">Your Response</div>
                        {feedback.responder && (
                          <div className="text-xs text-green-600">
                            by {feedback.responder.fname} {feedback.responder.lname}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-green-700">{feedback.adminResponse}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Submitted on {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => handleRespondToFeedback(feedback)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {feedback.adminResponse ? 'Update Response' : 'Respond'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      <FeedbackResponseModal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        feedback={selectedFeedback}
      />
    </div>
  );
};

export default AdminFeedbackDashboard;