import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // If the user does not have the required role, redirect to an unauthorized page or home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
