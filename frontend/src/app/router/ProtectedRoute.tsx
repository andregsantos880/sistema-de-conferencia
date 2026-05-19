import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { authStore } from '@/modules/auth/infrastructure/authStore';

interface Props {
  permissions?: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ permissions, children }) => {
  const location = useLocation();

  if (!authStore.estaAutenticado()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (permissions && permissions.length > 0) {
    const ok = permissions.some((p) => authStore.temPermissao(p));
    if (!ok) return <Navigate to="/app" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
