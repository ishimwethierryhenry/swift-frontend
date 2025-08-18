// =================== FEEDBACK MODAL COMPONENT ===================
// src/components/FeedbackModal.jsx
import React from 'react';

const FeedbackModal = ({ isOpen, onClose, selectedPool = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <FeedbackForm onClose={onClose} selectedPool={selectedPool} />
      </div>
    </div>
  );
};

export default FeedbackModal;