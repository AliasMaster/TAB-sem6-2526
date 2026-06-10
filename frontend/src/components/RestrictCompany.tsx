import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RestrictCompanyProps {
  children: React.ReactNode;
}

const RestrictCompany = ({ children }: RestrictCompanyProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a spinner
  }

  if (user?.role === 'Company') {
    return <Navigate to="/company" replace />;
  }

  return <>{children}</>;
};

export default RestrictCompany;
