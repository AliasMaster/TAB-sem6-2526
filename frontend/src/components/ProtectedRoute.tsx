import { Navigate } from 'react-router-dom';
import React from 'react'; // Zamiast react/jsx-dev-runtime

// Definiujemy typy propsów (ReactNode jest bezpieczniejszy niż JSX.Element)
interface ProtectedRouteProps {
  isLoggedIn: boolean;
  children: React.ReactNode; 
}

const ProtectedRoute = ({ isLoggedIn, children }: ProtectedRouteProps) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// TO JEST KLUCZOWE: Musimy pozwolić innym plikom na użycie tego komponentu
export default ProtectedRoute;