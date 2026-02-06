import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/auth';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
