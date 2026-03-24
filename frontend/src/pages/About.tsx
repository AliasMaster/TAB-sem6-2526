import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/about.css'; // Upewnij się, że ścieżka jest poprawna

const About = () => {
  return (
    <div className="about-page">
      {/* Sekcja Powitalna */}
      <section className="about-hero">
        <div className="container">
          <h1>Poznaj <span>EduForge</span></h1>
          <p>
            Zmieniamy sposób, w jaki świat się uczy. Nasza platforma łączy 
            najlepszych ekspertów z ambitnymi uczniami, tworząc przestrzeń 
            do nieograniczonego rozwoju.
          </p>
        </div>
      </section>

      {/* Statystyki nadlatujące na Hero */}
      <section className="about-stats">
        <div className="stat-item">
          <span className="stat-number">50+</span>
          <span className="stat-label">Kursów</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">10k+</span>
          <span className="stat-label">Uczniów</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">98%</span>
          <span className="stat-label">Zadowolonych</span>
        </div>
      </section>

      {/* Nasze Wartości */}
      <section className="about-mission">
        <h2>Dlaczego warto uczyć się z nami?</h2>
        <div className="mission-grid">
          <div className="mission-card">
            <span className="card-icon">🚀</span>
            <h3>Praktyczna Wiedza</h3>
            <p>
              Skupiamy się na umiejętnościach, których rynek pracy naprawdę potrzebuje. 
              Zero lania wody, 100% praktyki i realnych projektów do portfolio.
            </p>
          </div>
          
          <div className="mission-card">
            <span className="card-icon">💡</span>
            <h3>Najlepsi Mentorzy</h3>
            <p>
              Uczysz się od praktyków z wieloletnim doświadczeniem w branży, 
              którzy na co dzień rozwiązują problemy w największych firmach.
            </p>
          </div>

          <div className="mission-card">
            <span className="card-icon">🤝</span>
            <h3>Wsparcie Społeczności</h3>
            <p>
              Nie uczysz się sam. Dołączasz do aktywnego forum, gdzie zawsze 
              znajdziesz pomoc, motywację i inspirację do dalszego działania.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action na dole */}
      <section className="about-cta">
        <h2>Gotowy na kolejny krok w karierze?</h2>
        <p style={{ marginBottom: '2rem', color: '#555' }}>
          Dołącz do tysięcy studentów i rozpocznij swoją pierwszą lekcję już dziś.
        </p>
        <Link to="/katalog" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>
          Przeglądaj Katalog Kursów
        </Link>
      </section>
    </div>
  );
};

export default About;