// src/components/PasswordStrengthIndicator.jsx
// src/components/PasswordStrengthIndicator.jsx - FIXED VERSION
import React from 'react';
import { checkPasswordStrength } from '../validation/passwordSchema';

const PasswordStrengthIndicator = ({ password, showDetails = true }) => {
  const strength = checkPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div 
          className="h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${strength.percentage}%`,
            backgroundColor: strength.color 
          }}
        ></div>
      </div>

      {/* Strength Label */}
      <div className="flex justify-between items-center">
        <span 
          className="text-sm font-medium transition-colors duration-300"
          style={{ color: strength.color }}
        >
          {strength.strength}
        </span>
        <span className="text-xs text-white"> {/* ✅ Changed from text-gray-500 to text-white */}
          {strength.score}/{strength.maxScore}
        </span>
      </div>

      {/* Detailed Feedback */}
      {showDetails && strength.feedback.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-white mb-1">Password requirements:</p> {/* ✅ Changed from text-gray-600 to text-white */}
          <ul className="space-y-1">
            {strength.feedback.map((feedback, index) => (
              <li 
                key={index}
                className={`text-xs flex items-center ${
                  strength.isValid ? 'text-green-400' : 'text-white'  // ✅ Changed from text-gray-600 to text-white
                }`}
              >
                <span className={`mr-2 ${strength.isValid ? 'text-green-400' : 'text-white'}`}> {/* ✅ Changed from text-gray-400 to text-white */}
                  {strength.isValid ? '✓' : '•'}
                </span>
                {feedback}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Security Tips */}
      {showDetails && strength.score < 6 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <h4 className="text-xs font-medium text-amber-800">
                Strengthen your password
              </h4>
              <p className="text-xs text-amber-700 mt-1">
                A strong password helps protect your account from unauthorized access.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showDetails && strength.isValid && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <h4 className="text-xs font-medium text-green-800">
                Strong password!
              </h4>
              <p className="text-xs text-green-700 mt-1">
                Your password meets all security requirements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;