import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Auth/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, userRoles, isTokenExpiried } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isAuthenticated == undefined) {
        setLoading(true);
      } else {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [isAuthenticated]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated && isTokenExpiried()) {
    return <Navigate to="/login" />;
  }

  const hasAccess = allowedRoles.some((role) => userRoles().includes(role));

  if (!hasAccess) {
    return <Navigate to="/not-authorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
