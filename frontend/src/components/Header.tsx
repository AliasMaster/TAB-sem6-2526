import { NavLink, Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          Edu<span>Forge</span>
        </Link>
        
        <nav className="nav-links">
          {/* end sprawia, że strona główna jest aktywna TYLKO na ścieżce "/" */}
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Start
          </NavLink>
          <NavLink to="/katalog" className={({ isActive }) => isActive ? 'active' : ''}>
            Katalog Kursów
          </NavLink>
          <NavLink to="/nauka" className={({ isActive }) => isActive ? 'active' : ''}>
            Sekcja Nauki
          </NavLink> 
          <NavLink to="/forum" className={({ isActive }) => isActive ? 'active' : ''}>
            Forum
          </NavLink>
        </nav>

        <div className="auth-buttons">
          <Link to="/login" className="btn btn-login">Zaloguj</Link>
          <Link to="/register" className="btn btn-primary">Dołącz</Link>
        </div>
      </div>
    </header>
  );
}