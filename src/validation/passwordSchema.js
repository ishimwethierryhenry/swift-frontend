// swift-frontend/src/validation/passwordSchema.js - FRONTEND VERSION (No Joi) - UPDATED

// Password strength checker for frontend use
export const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: ["Password is required"], strength: "None", color: "#ffffff", textColor: "#ffffff", percentage: 0, maxScore: 8, isValid: false };

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push("At least 8 characters");

  if (password.length >= 12) score += 1;
  else feedback.push("12+ characters for better security");

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Include uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Include numbers");

  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push("Include special characters (@$!%*?&)");

  // Additional complexity checks
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) score += 1;

  // No common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1; // No repeating characters
  else feedback.push("Avoid repeating characters");

  if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
  else feedback.push("Avoid common patterns");

  // Determine strength level
  let strength = "Very Weak";
  let color = "#6bff89ff"; // Changed from #44ff82ff to lighter red

  if (score >= 8) {
    strength = "Very Strong";
    color = "#51cf66"; // Changed from #00aa00 to brighter green
  } else if (score >= 6) {
    strength = "Strong";
    color = "#69db7c"; // Changed from #66aa00 to lighter green
  } else if (score >= 4) {
    strength = "Moderate";
    color = "#ffd43b"; // Changed from #aaaa00 to brighter yellow
  } else if (score >= 2) {
    strength = "Weak";
    color = "#ffa726"; // Changed from #aa6600 to brighter orange
  }

  return {
    score: Math.min(score, 8),
    maxScore: 8,
    percentage: Math.min((score / 8) * 100, 100),
    strength,
    color,
    feedback: feedback.length > 0 ? feedback : ["Password meets security requirements"],
    isValid: score >= 6 // Require at least "Strong" for acceptance
  };
};

// Basic frontend validation (without Joi)
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password cannot exceed 128 characters");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)");
  }

  if (!/^[A-Za-z\d@$!%*?&]+$/.test(password)) {
    errors.push("Password contains invalid characters");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate password confirmation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: "Password confirmation is required" };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "Password confirmation does not match" };
  }

  return { isValid: true };
};

// 🆕 NEW: Validate forced password change for first-time login
export const validateForcePasswordChange = (newPassword, confirmPassword) => {
  const errors = {};

  // Password validation using existing function
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.errors[0];
  }

  // Confirm password validation using existing function
  const confirmValidation = validatePasswordConfirmation(newPassword, confirmPassword);
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate reset password form
export const validateResetPassword = (token, newPassword, confirmPassword) => {
  const errors = {};

  // Token validation
  if (!token) {
    errors.token = "Reset token is required";
  } else if (!/^[a-f0-9]{64}$/i.test(token)) {
    errors.token = "Invalid reset token format";
  }

  // Password validation
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.errors[0];
  }

  // Confirm password validation
  const confirmValidation = validatePasswordConfirmation(newPassword, confirmPassword);
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate change password form
export const validateChangePassword = (currentPassword, newPassword, confirmPassword) => {
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.errors[0];
  }

  const confirmValidation = validatePasswordConfirmation(newPassword, confirmPassword);
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate forgot password form
export const validateForgotPassword = (email) => {
  const errors = {};

  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 🆕 UPDATED: Export object with new function included
export default {
  checkPasswordStrength,
  validatePassword,
  validatePasswordConfirmation,
  validateForcePasswordChange, // 🆕 NEW FUNCTION ADDED
  validateResetPassword,
  validateChangePassword,
  validateForgotPassword
};