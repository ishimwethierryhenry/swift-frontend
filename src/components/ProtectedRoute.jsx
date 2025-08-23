// src/components/ProtectedRoute.jsx - Enhanced version with role checking
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LoadingSpinner } from '../components/LoadingSpinner';


const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const location = useLocation();
  const { user, isLoading } = useSelector((state) => state.login);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check if user is authenticated (has token and user data)
  const token = localStorage.getItem('token');
  const isAuthenticated = token && user;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user needs to change password (first login)
  if (user.isFirstLogin || user.requiresPasswordChange) {
    // Allow access to password change page
    if (location.pathname === '/change-password') {
      return children;
    }
    
    // Redirect to password change for all other routes
    return <Navigate to="/change-password" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    switch (user.role) {
      case 'guest':
        return <Navigate to="/guest-dashboard" replace />;
      case 'admin':
      case 'operator':
      case 'overseer':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated, doesn't need password change, and has correct role
  return children;
};

export default ProtectedRoute;