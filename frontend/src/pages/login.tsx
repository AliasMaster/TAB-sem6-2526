import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Dodany Link
import type { User } from '../App';

interface LoginProps {
  setUser: (user: User | null) => void;
}

const Login = ({ setUser }: LoginProps) => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const MOCK_USERS: User[] = [
    { id: 1, login: 'admin', email: 'admin@eduforge.com', role: 'Admin' },
    { id: 2, login: 'client_test', email: 'client@eduforge.com', role: 'Client' },
    { id: 3, login: 'firm_test', email: 'firm@eduforge.com', role: 'Firm' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = MOCK_USERS.find(
      (u) => u.email === identifier || u.login === identifier
    );

    if (foundUser && password.length >= 6) {
      setUser(foundUser);
      navigate('/');
    } else {
      setError('Invalid credentials or password too short (min 6 chars).');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.glowBgLeft}></div>
      <div style={styles.glowBgRight}></div>

      <div style={styles.mainContent}>
        
        <div style={styles.sideColumn}>
          <div style={styles.brandWrapper}>
            <h1 style={styles.brandTitle}>Edu<span style={styles.brandHighlight}>Forge</span></h1>
            <p style={styles.brandSubtitle}>Unlock your potential through expert-led courses.</p>
          </div>
        </div>

        <div style={styles.loginCard}>
          <h2 style={styles.cardTitle}>Sign In</h2>
          <p style={styles.cardSubtitle}>Enter your details to access your account</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. admin"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>

            {error && <p style={styles.errorText}>{error}</p>}

            <button type="submit" className="btn btn-primary" style={styles.loginButton}>
              Login Now
            </button>
          </form>

          {/* NOWY ELEMENT: LINK DO REJESTRACJI */}
          <div style={styles.registerPrompt}>
            Don't have an account? <Link to="/register" style={styles.registerLink}>Register here</Link>
          </div>
        </div>

        <div style={styles.sideColumn}>
          <div style={styles.promoWrapper}>
            <p style={styles.quoteText}>"Knowledge is the key to Forge your future."</p>
            <div style={styles.badgePromo}>NEW COURSES 2026</div>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#0c111e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '0 2rem',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'sans-serif'
  },
  glowBgLeft: {
    position: 'absolute',
    width: '40vw',
    height: '80vh',
    background: 'radial-gradient(circle at center, rgba(246, 173, 85, 0.12) 0%, rgba(12, 17, 30, 0) 70%)',
    top: '10%',
    left: '-10%',
    zIndex: 1,
  },
  glowBgRight: {
    position: 'absolute',
    width: '40vw',
    height: '80vh',
    background: 'radial-gradient(circle at center, rgba(246, 173, 85, 0.08) 0%, rgba(12, 17, 30, 0) 70%)',
    bottom: '10%',
    right: '-10%',
    zIndex: 1,
  },
  mainContent: {
    paddingTop: '100px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1400px',
    zIndex: 10,
    flexWrap: 'nowrap',
  },
  sideColumn: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    padding: '0 20px',
  },
  brandWrapper: { textAlign: 'center' },
  brandTitle: { fontSize: '2.8rem', fontWeight: 'bold', letterSpacing: '-1px' },
  brandHighlight: { color: '#f6ad55' },
  brandSubtitle: { fontSize: '1.2rem', opacity: 0.8, marginTop: '1rem', maxWidth: '280px' },
  promoWrapper: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' },
  quoteText: { fontStyle: 'italic', fontSize: '1.2rem', maxWidth: '300px', lineHeight: '1.6' },
  badgePromo: {
    backgroundColor: '#f6ad55',
    color: '#0c111e',
    padding: '0.6rem 1.4rem',
    borderRadius: '30px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  loginCard: {
    flex: '0 0 420px',
    backgroundColor: '#ffffff',
    padding: '3.5rem 3rem',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 20,
    textAlign: 'center',
    border: '4px solid #f6ad55',
  },
  cardTitle: { color: '#111827', fontSize: '2.4rem', marginBottom: '0.8rem', fontWeight: '800' },
  cardSubtitle: { color: '#6b7280', marginBottom: '2.5rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.6rem' },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', color: '#374151', fontWeight: '700', marginBottom: '0.6rem' },
  input: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    outline: 'none',
    fontSize: '1rem',
    backgroundColor: '#f9fafb',
  },
  loginButton: {
    width: '100%',
    padding: '1.2rem',
    fontSize: '1.2rem',
    fontWeight: '800',
    cursor: 'pointer',
    border: 'none',
    marginTop: '1rem',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  errorText: { color: '#ef4444', fontSize: '0.9rem', fontWeight: '600' },
  // STYLE DLA PROMPTU REJESTRACJI
  registerPrompt: {
    marginTop: '1.5rem',
    fontSize: '0.95rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  registerLink: {
    color: '#f6ad55',
    textDecoration: 'none',
    fontWeight: '700',
    marginLeft: '5px'
  }
};

export default Login;