import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Temporariamente desabilitado para debug - permitir acesso sem login
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // DEBUG: Sempre permitir acesso por enquanto
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  
  // Comentado temporariamente para debug
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  
  return <>{children}</>;
};

export default ProtectedRoute;