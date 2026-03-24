import React from 'react';
import { useNavigate } from 'react-router-dom';

// Odbieramy funkcję z App.tsx
interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

const Login = ({ setIsLoggedIn }: LoginProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 1. Ustawiamy, że użytkownik jest zalogowany
    setIsLoggedIn(true);
    // 2. Wyrzucamy go automatycznie na stronę główną (Start)
    navigate('/');
  };

  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h2>Logowanie do EduForge</h2>
      <p style={{ marginBottom: '2rem' }}>Wpisz dane, aby kontynuować naukę.</p>
      
      <button 
        onClick={handleLogin}
        className="btn btn-primary"
      >
        Zaloguj mnie testowo!
      </button>
    </div>
  );
};

export default Login;