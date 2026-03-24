import { NavLink, Link } from 'react-router-dom';
import '../assets/styles/header.css'; 

interface HeaderProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void; // Dodane, by móc wylogować
}

export default function Header({ isLoggedIn, setIsLoggedIn }: HeaderProps) {
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
          {isLoggedIn ? (
            <div className="user-menu">
              {/* IKONA KOSZYKA (SVG) */}
              <Link to="/koszyk" className="cart-btn" title="Twój koszyk">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </Link>

              {/* KLIKALNY PROFIL Z AWATAREM */}
              <Link to="/profil" className="profile-link">
                <div className="avatar">A</div>
                <span className="nickname">Admin</span>
              </Link>

              {/* PRZYCISK WYLOGUJ */}
              <button 
                onClick={() => setIsLoggedIn(false)} 
                className="btn btn-login" 
                style={{ paddingLeft: '0.5rem' }}
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