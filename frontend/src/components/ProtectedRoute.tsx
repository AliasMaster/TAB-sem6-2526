import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f0c1b',
        color: '#a855f7',
        gap: '1rem'
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid rgba(168, 85, 247, 0.2)',
          borderTop: '3px solid #a855f7',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite'
        }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Weryfikacja sesji...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;