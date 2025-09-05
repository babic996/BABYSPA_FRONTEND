import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Auth/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { userRoles, isTokenExpired, logoutUser, tokenExists } = useAuth();

  if (!tokenExists() || isTokenExpired()) {
    logoutUser();
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.some((role) => userRoles().includes(role));

  if (!hasAccess && allowedRoles.length > 0) {
    return <Navigate to="/not-authorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
