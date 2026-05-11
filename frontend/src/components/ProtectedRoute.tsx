import { Navigate } from 'react-router-dom';
import React from 'react';
import type { User } from '../App'; // Importujemy typ użytkownika

interface ProtectedRouteProps {
  // Zmieniamy isLoggedIn na user
  user: User | null;
  children: React.ReactNode; 
}

const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  // Jeśli user jest nullem (nikt nie jest zalogowany), wyślij go do logowania
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Jeśli user istnieje, pozwól mu zobaczyć zawartość (np. Lekcje)
  return <>{children}</>;
};

export default ProtectedRoute;