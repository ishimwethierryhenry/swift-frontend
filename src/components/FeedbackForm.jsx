// =================== FEEDBACK FORM COMPONENT ===================
// src/components/FeedbackForm.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Star, Send, MessageSquare, AlertTriangle, ThumbsUp, Lightbulb, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const FeedbackForm = ({ onClose, selectedPool = null }) => {
  const user = useSelector((state) => state.user.user);
  const [pools, setPools] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    poolId: selectedPool?.id || '',
    feedbackType: 'general',
    priority: 'medium',
    title: '',
    description: '',
    rating: 0,
    isAnonymous: false
  });

  // Fetch pools for dropdown
  useEffect(() => {
    const fetchPools = async () => {
      try {
        const token = localStorage.getItem('token');
        const userLocation = localStorage.getItem('user_location') || 'serena';
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/pools/${userLocation}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setPools(response.data.allPools);
      } catch (error) {
        console.error('Error fetching pools:', error);
      }
    };

    if (user?.role === 'guest') {
      fetchPools();
    }
  }, [user]);

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-500' },
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-yellow-500' },
    { value: 'issue', label: 'Report Issue', icon: AlertTriangle, color: 'text-red-500' },
    { value: 'compliment', label: 'Compliment', icon: ThumbsUp, color: 'text-green-500' },
    { value: 'feature_request', label: 'Feature Request', icon: Settings, color: 'text-purple-500' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.title.length < 5) {
      toast.error('Title must be at least 5 characters long');
      return;
    }

    if (formData.description.length < 10) {
      toast.error('Description must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        poolId: formData.poolId || null,
        rating: formData.rating > 0 ? formData.rating : null
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/feedback/submit`,
        submitData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Feedback submitted successfully! Thank you for your input.');
      
      // Reset form
      setFormData({
        poolId: '',
        feedbackType: 'general',
        priority: 'medium',
        title: '',
        description: '',
        rating: 0,
        isAnonymous: false
      });

      if (onClose) onClose();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-blue-500" />
          Share Your Feedback
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pool Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Pool (Optional)
          </label>
          <select
            name="poolId"
            value={formData.poolId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a pool (or leave blank for general feedback)</option>
            {pools.map(pool => (
              <option key={pool.id} value={pool.id}>
                {pool.name} - {pool.location}
              </option>
            ))}
          </select>
        </div>

        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Feedback Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {feedbackTypes.map(type => {
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.feedbackType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="feedbackType"
                    value={type.value}
                    checked={formData.feedbackType === type.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <div className="flex gap-2">
            {priorities.map(priority => (
              <label
                key={priority.value}
                className={`px-3 py-2 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  formData.priority === priority.value
                    ? priority.color + ' ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                {priority.label}
              </label>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief summary of your feedback"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.title.length}/200 characters
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please provide detailed feedback..."
            rows={4}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/2000 characters
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating (Optional)
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className={`p-1 transition-colors ${
                  star <= formData.rating
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {formData.rating} out of 5 stars
              </span>
            )}
          </div>
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Submit anonymously (your name won't be shown to admins)
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;