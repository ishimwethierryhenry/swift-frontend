// =================== FEEDBACK RESPONSE MODAL ===================
// src/components/FeedbackResponseModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send } from 'lucide-react';
import { respondToFeedback, updateFeedbackStatus } from '../redux/slices/feedbackSlice';
import { toast } from 'react-toastify';

const FeedbackResponseModal = ({ isOpen, onClose, feedback }) => {
  const dispatch = useDispatch();
  const { responseLoading } = useSelector(state => state.feedback);
  
  const [adminResponse, setAdminResponse] = useState('');
  const [status, setStatus] = useState('under_review');
  const [responseType, setResponseType] = useState('respond'); // 'respond' or 'status_only'

  useEffect(() => {
    if (feedback) {
      setAdminResponse(feedback.adminResponse || '');
      setStatus(feedback.status);
      setResponseType(feedback.adminResponse ? 'respond' : 'respond');
    }
  }, [feedback]);

  if (!isOpen || !feedback) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (responseType === 'respond') {
        if (!adminResponse.trim()) {
          toast.error('Please enter a response message');
          return;
        }
        
        await dispatch(respondToFeedback({
          feedbackId: feedback.id,
          adminResponse: adminResponse.trim(),
          status
        })).unwrap();
        
        toast.success('Response sent successfully');
      } else {
        await dispatch(updateFeedbackStatus({
          feedbackId: feedback.id,
          status
        })).unwrap();
        
        toast.success('Status updated successfully');
      }
      
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to process feedback');
    }
  };

  const statusOptions = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {feedback.adminResponse ? 'Update Response' : 'Respond to Feedback'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Feedback Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{feedback.title}</h3>
            <p className="text-gray-700 mb-3">{feedback.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="capitalize">{feedback.feedbackType.replace('_', ' ')}</span>
              <span className="capitalize">{feedback.priority} priority</span>
              {!feedback.isAnonymous && feedback.guest && (
                <span>by {feedback.guest.fname} {feedback.guest.lname}</span>
              )}
              {feedback.rating && (
                <span>{feedback.rating}★ rating</span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Response Type Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setResponseType('respond')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  responseType === 'respond'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Send Response
              </button>
              <button
                type="button"
                onClick={() => setResponseType('status_only')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  responseType === 'status_only'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Update Status Only
              </button>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Response Message */}
            {responseType === 'respond' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Write your response to the guest..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required={responseType === 'respond'}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {adminResponse.length} characters
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={responseLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {responseLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {responseType === 'respond' ? 'Send Response' : 'Update Status'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackResponseModal;