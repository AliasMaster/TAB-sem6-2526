import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          Edu<span>Forge</span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/">Katalog Kursów</Link>
          <Link to="/forum">Społeczność</Link>
        </nav>

        <div className="auth-buttons">
          <Link to="/login" className="btn btn-login">Zaloguj</Link>
          <Link to="/register" className="btn btn-primary">Dołącz</Link>
        </div>
      </div>
    </header>
  );
}