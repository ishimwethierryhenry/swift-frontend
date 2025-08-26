// =================== UPDATED FEEDBACK FORM WITH EXISTING REDUX ===================
// src/components/FeedbackForm.jsx - Updated to work with existing Redux structure
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Star, Send, MessageSquare, AlertTriangle, ThumbsUp, Lightbulb, Settings, X, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { variables } from '../data/constants';

const FeedbackForm = ({ onClose, pools = [], poolsLoading = false, poolsError = null }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  
  // Use pools from props (passed from GuestFeedback component)
  const availablePools = pools || [];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    poolId: '',
    feedbackType: 'general',
    priority: 'medium',
    title: '',
    description: '',
    rating: 0,
    isAnonymous: false
  });

  // Debug logging
  useEffect(() => {
    console.log('🎯 FeedbackForm - Available pools:', availablePools);
    console.log('🎯 FeedbackForm - Pools loading:', poolsLoading);
    console.log('🎯 FeedbackForm - User:', user);
  }, [availablePools, poolsLoading, user]);

  // Feedback type options with enhanced styling
  const feedbackTypes = [
    { 
      value: 'general', 
      label: 'General Feedback', 
      icon: MessageSquare, 
      color: 'from-blue-500 to-cyan-500',
      description: 'General thoughts and comments'
    },
    { 
      value: 'suggestion', 
      label: 'Suggestion', 
      icon: Lightbulb, 
      color: 'from-yellow-500 to-orange-500',
      description: 'Ideas for improvement'
    },
    { 
      value: 'issue', 
      label: 'Report Issue', 
      icon: AlertTriangle, 
      color: 'from-red-500 to-pink-500',
      description: 'Report bugs or problems'
    },
    { 
      value: 'compliment', 
      label: 'Compliment', 
      icon: ThumbsUp, 
      color: 'from-green-500 to-emerald-500',
      description: 'Positive feedback'
    },
    { 
      value: 'feature_request', 
      label: 'Feature Request', 
      icon: Settings, 
      color: 'from-purple-500 to-indigo-500',
      description: 'Request new features'
    }
  ];

  // Priority levels with visual indicators
  const priorities = [
    { 
      value: 'low', 
      label: 'Low', 
      color: 'bg-gray-500/20 text-gray-300 border-gray-400/50',
      selectedColor: 'bg-gray-500/40 text-gray-100 border-gray-300 ring-2 ring-gray-400/50'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      color: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
      selectedColor: 'bg-blue-500/40 text-blue-100 border-blue-300 ring-2 ring-blue-400/50'
    },
    { 
      value: 'high', 
      label: 'High', 
      color: 'bg-orange-500/20 text-orange-300 border-orange-400/50',
      selectedColor: 'bg-orange-500/40 text-orange-100 border-orange-300 ring-2 ring-orange-400/50'
    },
    { 
      value: 'urgent', 
      label: 'Urgent', 
      color: 'bg-red-500/20 text-red-300 border-red-400/50',
      selectedColor: 'bg-red-500/40 text-red-100 border-red-300 ring-2 ring-red-400/50'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ 
      ...prev, 
      rating: prev.rating === rating ? 0 : rating // Allow deselecting
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title for your feedback');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a description of your feedback');
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

      console.log('📤 Submitting feedback:', submitData);
      console.log('📤 API Endpoint:', `${variables.SERVER_URL}/guest-feedback/submit`);
      console.log('📤 Token exists:', !!token);
      console.log('📤 Selected Pool Details:', {
        poolId: submitData.poolId,
        poolIdType: typeof submitData.poolId,
        availablePools: availablePools
      });

      // Use your constants for the base URL - CHECK THE CORRECT ENDPOINT
      const response = await axios.post(
        `${variables.SERVER_URL}/guest-feedback/submit`, // Changed from /feedback/submit
        submitData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Feedback submitted successfully:', response.data);
      
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

      if (onClose) {
        setTimeout(() => onClose(), 1000); // Small delay to show success message
      }
      
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.validationError || 
                          'Failed to submit feedback. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Enhanced Glassmorphism Container */}
      <div className="relative bg-gradient-to-br from-slate-800/60 via-blue-900/60 to-teal-800/60 backdrop-blur-2xl rounded-2xl border border-cyan-400/30 shadow-2xl max-w-2xl mx-auto overflow-hidden">
        
        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-cyan-400/30 via-blue-400/20 to-teal-400/30 p-px animate-pulse">
          <div className="h-full w-full rounded-2xl bg-gradient-to-br from-slate-800/80 via-blue-900/80 to-teal-800/80 backdrop-blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Share Your Feedback
              </h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Pool Selection */}
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Related Pool (Optional)
              </label>
              
              {/* Show pools loading state */}
              {poolsLoading && (
                <div className="flex items-center justify-center py-4 text-cyan-400">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Loading pools for your location...
                </div>
              )}
              
              {/* Show pools error */}
              {poolsError && (
                <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm mb-2">
                  Failed to load pools. You can still submit general feedback.
                </div>
              )}
              
              {/* Pool selection dropdown */}
              {!poolsLoading && (
                <div className="relative">
                  <select
                    name="poolId"
                    value={formData.poolId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="" className="bg-slate-800 text-white">
                      Select a pool (or leave blank for general feedback)
                    </option>
                    {availablePools.map(pool => (
                      <option key={pool.id} value={pool.id} className="bg-slate-800 text-white">
                        {pool.name} - {pool.location}
                      </option>
                    ))}
                  </select>
                  
                  {/* Show message when no pools available */}
                  {!poolsLoading && availablePools.length === 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      No pools available in your location. You can still submit general feedback.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-3">
                Feedback Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {feedbackTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = formData.feedbackType === type.value;
                  return (
                    <label
                      key={type.value}
                      className={`relative group cursor-pointer transition-all duration-200 ${
                        isSelected ? 'scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedbackType"
                        value={type.value}
                        checked={isSelected}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-4 border rounded-xl transition-all duration-200 ${
                        isSelected 
                          ? `bg-gradient-to-br ${type.color} bg-opacity-20 border-white/40 shadow-lg`
                          : 'bg-white/5 border-white/20 hover:border-white/30 hover:bg-white/10'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${
                            isSelected ? 'text-white' : 'text-gray-300'
                          }`} />
                          <div>
                            <div className={`text-sm font-medium ${
                              isSelected ? 'text-white' : 'text-gray-200'
                            }`}>
                              {type.label}
                            </div>
                            <div className={`text-xs ${
                              isSelected ? 'text-gray-200' : 'text-gray-400'
                            }`}>
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-3">
                Priority Level
              </label>
              <div className="flex flex-wrap gap-2">
                {priorities.map(priority => (
                  <label
                    key={priority.value}
                    className="cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      formData.priority === priority.value
                        ? priority.selectedColor
                        : priority.color + ' hover:bg-opacity-30'
                    }`}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief summary of your feedback"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm"
                required
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.title.length}/200 characters
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide detailed feedback..."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-200 resize-none backdrop-blur-sm"
                required
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.description.length}/2000 characters
              </div>
            </div>

            {/* Rating Section */}
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Overall Rating (Optional)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className={`p-1 transition-all duration-200 hover:scale-110 ${
                      star <= formData.rating
                        ? 'text-yellow-400'
                        : 'text-gray-400 hover:text-yellow-300'
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
                {formData.rating > 0 && (
                  <span className="ml-3 text-sm text-gray-300">
                    {formData.rating} out of 5 stars
                  </span>
                )}
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isAnonymous"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="w-4 h-4 text-cyan-600 bg-white/10 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <label htmlFor="isAnonymous" className="text-sm text-gray-300">
                Submit anonymously (your name won't be shown to admins)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/20">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg transform hover:scale-105 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        /* Enhanced glassmorphism effects */
        .backdrop-blur-2xl {
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
        }
        
        /* Enhanced focus states */
        input:focus, textarea:focus, select:focus {
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.3), 0 0 25px rgba(6, 182, 212, 0.1);
        }
        
        /* Smooth animations */
        * {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Hover scale animations */
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        /* Enhanced selection states */
        option {
          background-color: rgb(30 41 59);
          color: white;
        }
        
        /* Custom scrollbar for textarea */
        textarea::-webkit-scrollbar {
          width: 4px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;