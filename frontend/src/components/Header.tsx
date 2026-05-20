import { NavLink, Link } from 'react-router-dom';
import '../assets/styles/header.css';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container header-content">
        {/* LOGO */}
        <Link to="/" className="logo">
          Edu<span>Forge</span>
        </Link>

        {/* NAWIGACJA ŚRODKOWA */}
        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}>
            Start
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) => (isActive ? 'active' : '')}>
            Katalog Kursów
          </NavLink>
          <NavLink
            to="/community"
            className={({ isActive }) => (isActive ? 'active' : '')}>
            Forum
          </NavLink>

          {user?.role === 'Admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'active' : '')}
              style={{ color: '#f6ad55', fontWeight: 'bold' }}>
              Admin Panel
            </NavLink>
          )}
          {user?.role === 'Company' && (
            <NavLink
              to="/company"
              className={({ isActive }) => (isActive ? 'active' : '')}
              style={{ color: '#f6ad55', fontWeight: 'bold' }}>
              Firma Panel
            </NavLink>
          )}
        </nav>

        {/* SEKRETY LOGOWANIA / PROFILU */}
        <div className="auth-buttons">
          {user ? (
            <div
              className="user-menu"
              style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* LINK DO PROFILU */}
              <Link
                to="/profile"
                className="profile-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'white',
                }}>
                <div
                  className="user-info"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    lineHeight: '1.2',
                  }}>
                  <span className="nickname" style={{ fontWeight: 'bold' }}>
                    Profil
                  </span>
                  <small style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    ({user.role})
                  </small>
                </div>
              </Link>

              {/* PRZYCISK WYLOGUJ */}
              <button
                onClick={logout}
                className="btn btn-login"
                style={{ marginLeft: '10px' }}>
                Wyloguj
              </button>
            </div>
          ) : (
            /* JEŚLI NIEZALOGOWANY */
            <>
              <Link to="/login" className="btn btn-login">
                Zaloguj
              </Link>
              <Link to="/register" className="btn btn-primary">
                Dołącz
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
