// =================== UPDATED FEEDBACK BUTTON COMPONENT ===================
// src/components/FeedbackButton.jsx
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeedbackButton = ({ selectedPool = null, className = "" }) => {
  const navigate = useNavigate();

  const handleFeedbackClick = () => {
    // Navigate to feedback page
    navigate('/feedback');
  };

  return (
    <button
      onClick={handleFeedbackClick}
      className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      <MessageSquare className="h-4 w-4" />
      Give Feedback
    </button>
  );
};

export default FeedbackButton;