import { NavLink, Link, useNavigate } from 'react-router-dom';
import '../assets/styles/header.css'; 
import type { User } from '../App'; 

interface HeaderProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export default function Header({ user, setUser }: HeaderProps) {
  const navigate = useNavigate();
  const avatarLetter = user?.login ? user.login.charAt(0).toUpperCase() : '?';

  // NOWA FUNKCJA WYLOGOWANIA
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // KRYTYCZNE: Bez tego serwer nie "zobaczy" ciastka, które ma usunąć
      });
    } catch (err) {
      console.error("Błąd podczas wylogowywania:", err);
    } finally {
      // Zawsze czyścimy stan lokalny, nawet jeśli sieć zawiedzie
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          Edu<span>Forge</span>
        </Link>
        
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Start</NavLink>
          <NavLink to="/katalog" className={({ isActive }) => isActive ? 'active' : ''}>Katalog Kursów</NavLink>
          <NavLink to="/nauka" className={({ isActive }) => isActive ? 'active' : ''}>Sekcja Nauki</NavLink> 
          <NavLink to="/forum" className={({ isActive }) => isActive ? 'active' : ''}>Forum</NavLink>
        </nav>

        <div className="auth-buttons">
          {user ? (
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Link to="/koszyk" className="cart-btn" title="Twój koszyk">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </Link>

              <Link to="/profil" className="profile-link" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
                <div className="avatar-wrapper">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Avatar" className="avatar-image" />
                  ) : (
                    <div className="avatar-fallback">{avatarLetter}</div>
                  )}
                </div>
                <div className="user-info" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  <span className="nickname" style={{ fontWeight: 'bold' }}>{user.login}</span>
                  <small style={{ fontSize: '0.7rem', opacity: 0.6 }}>({user.role})</small>
                </div>
              </Link>

              {/* PODPIĘTA NOWA FUNKCJA */}
              <button 
                onClick={handleLogout} 
                className="btn btn-login" 
                style={{ marginLeft: '10px' }}
              >
                Wyloguj
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-login">Zaloguj</Link>
              <Link to="/register" className="btn btn-primary">Dołącz</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}