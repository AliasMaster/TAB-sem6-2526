import { Link } from 'react-router-dom';
import '../assets/styles/footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        
        {/* UPPER GRID */}
        <div className="footer-grid">
          
          {/* COL 1: BRAND & MISSION */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              Edu<span>Forge</span>
            </Link>
            <p className="footer-desc">
              Nowoczesna i bezpieczna platforma e-learningowa stworzona dla ekspertów, firm i studentów pragnących rozwijać swoje umiejętności.
            </p>
            <div className="footer-socials">
              {/* FACEBOOK */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              {/* TWITTER / X */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Twitter / X">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              {/* LINKEDIN */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="LinkedIn">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              {/* GITHUB */}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="GitHub">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* COL 2: PLATFORM NAVIGATION */}
          <div className="footer-links-col">
            <h4>Platforma</h4>
            <ul>
              <li><Link to="/">Strona Główna</Link></li>
              <li><Link to="/catalog">Katalog Kursów</Link></li>
              <li><Link to="/community">Forum Społeczności</Link></li>
              <li><Link to="/about">O nas</Link></li>
            </ul>
          </div>

          {/* COL 3: LEGAL & INFO */}
          <div className="footer-links-col">
            <h4>Informacje</h4>
            <ul>
              <li><a href="#regulamin">Regulamin</a></li>
              <li><a href="#prywatnosc">Polityka Prywatności</a></li>
              <li><a href="#bezpieczenstwo">Bezpieczeństwo</a></li>
              <li><a href="#pomoc">Pomoc & FAQ</a></li>
            </ul>
          </div>

          {/* COL 4: CONTACT CARD */}
          <div className="footer-links-col">
            <h4>Kontakt</h4>
            <div className="footer-contact-card">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span className="contact-text">
                  <strong>Email:</strong><br />
                  <a href="mailto:support@eduforge.com">support@eduforge.com</a>
                </span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">
                  <strong>Telefon:</strong><br />
                  +48 22 123 45 67
                </span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span className="contact-text">
                  <strong>Adres:</strong><br />
                  ul. Nowoczesna 12,<br />
                  00-001 Warszawa
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} EduForge. Wszelkie prawa zastrzeżone. Platforma E-learningowa TAB-sem6.
          </div>
          <div className="footer-bottom-links">
            <a href="#cookies">Cookies</a>
            <a href="#sitemap">Mapa Strony</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
