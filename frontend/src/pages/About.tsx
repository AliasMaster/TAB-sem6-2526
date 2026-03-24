import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/about.css'; // Upewnij się, że ścieżka jest poprawna

const About = () => {
  return (
    <div className="about-page">
      {/* Sekcja Powitalna (Hero) */}
      <section className="about-hero">
        <div className="container about-hero-content">
          <h1>Budujemy Twoją <span>Karierę</span></h1>
          <p>
            Zyskaj praktyczne umiejętności od liderów branży. EduForge to Twój 
            pomost do sukcesu zawodowego – od pierwszej linijki kodu do pierwszej pracy.
          </p>
        </div>
      </section>

      {/* Sekcja Statystyk (Overlay) */}
      <section className="about-stats container">
        <div className="stat-item">
          <span className="stat-number">50+</span>
          <span className="stat-label">Kursów</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">10k+</span>
          <span className="stat-label">Absolwentów</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">98%</span>
          <span className="stat-label">Satysfakcji</span>
        </div>
      </section>

      {/* Sekcja Wartości / Dlaczego My */}
      <section className="about-mission">
        <div className="section-header">
          <h2>Dlaczego EduForge?</h2>
          <p>Skupiamy się na tym, co najważniejsze dla Twojego rozwoju i kariery.</p>
        </div>
        
        <div className="mission-grid">
          {/* Karta 1 - Praktyka i Portfolio */}
          <div className="mission-card">
            <div className="card-icon-container">
              {/* Ikona: Rocket */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.71-2.5 0-3.21l-3-3z"></path>
                <path d="M13.5 10.5l-9-9"></path>
                <path d="M11 6a4 4 0 0 1 4 4c0 .88-.31 1.67-.82 2.3l4.82 4.82c1.37 1.37 1.37 3.58 0 4.95a3.5 3.5 0 0 1-4.95 0L10.3 18.25c-.63.51-1.42.82-2.3.82a4 4 0 0 1-4-4c0-.36.03-.71.1-1.05"></path>
              </svg>
            </div>
            <h3>Praktyczne Projekty</h3>
            <p>
              Programy stworzone we współpracy z pracodawcami. Zyskaj kompetencje, 
              których rynek szuka TERAZ. Każdy kurs kończy się gotowym projektem do portfolio.
            </p>
          </div>
          
          {/* Karta 2 - Eksperci */}
          <div className="mission-card">
            <div className="card-icon-container">
              {/* Ikona: Award/Medal */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <h3>Certyfikowani Eksperci</h3>
            <p>
              Uczysz się od aktywnych zawodowo praktyków z wieloletnim doświadczeniem, 
              którzy dzielą się wiedzą zdobytą w realnych projektach komercyjnych.
            </p>
          </div>

          {/* Karta 3 - Wsparcie i Dostęp */}
          <div className="mission-card">
            <div className="card-icon-container">
              {/* Ikona: Users/Community */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Wsparcie Społeczności</h3>
            <p>
              Nie uczysz się sam. Dołączasz do aktywnego forum, gdzie zawsze 
              znajdziesz pomoc, motywację i inspirację od mentorów i innych studentów.
            </p>
          </div>
        </div>
      </section>

      {/* Sekcja Wezwania do Działania (CTA) na dole */}
      <section className="about-cta">
        <div className="container cta-content">
          <h2>Gotowy na kolejny krok?</h2>
          <p>
            Odkryj swoją ścieżkę rozwoju i rozpocznij naukę już dziś. 
            Twoja przyszłość w IT zaczyna się tutaj.
          </p>
          <Link to="/katalog" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
            Zobacz Katalog Kursów
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;