import { courses } from '../data'; 
import CourseCard from '../components/CourseCard';
import { Link } from 'react-router-dom';

export default function HomePage() {
  // 3 pierwsze kursy jako "Polecane"
  const featuredCourses = courses.slice(0, 3);


  return (
    
    <div className="home-page">
      {/* --- SEKCJA HERO --- */}
      <section className="hero-section">
  <div className="container hero-flex">
    
    {/* LEWA STRONA: Tekst i Przyciski */}
    <div className="hero-content">
      <span className="badge">Nowość: Kursy AI 2026</span>
      <h1 className="hero-title">
        Rozwijaj swoje pasje <br /> z <span>najlepszymi ekspertami</span>.
      </h1>
      <p className="hero-subtitle">
        Dołącz do 15 000+ studentów i zdobądź certyfikaty...
      </p>
      <div className="hero-btns">
        <Link to="/katalog" className="btn btn-hero-gradient">Przeglądaj Kursy<span className="btn-icon">→</span></Link>
        <Link to="/about" className="btn btn-hero-secondary-3d">Dowiedz się więcej</Link>
      </div>
    </div>

    {/* PRAWA STRONA: TO JEST TWOJE MIEJSCE NA EFEKTY WIZUALNE */}
    <div className="hero-image-placeholder">
      <div className="abstract-shape"></div> {/* To jest ta świecąca kula */}
    </div>

  </div>
</section>

      {/* --- SEKCJA KURSÓW --- */}
      <section className="courses-section">
        <div className="container">
          <div className="section-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '3rem' 
          }}>
            <h2 className="section-title" style={{ margin: 0 }}>Polecane Kursy</h2>
            <Link to="/katalog" className="view-all" style={{ 
              color: 'var(--accent)', 
              textDecoration: 'none', 
              fontWeight: 'bold' 
            }}>
              Zobacz wszystkie kursy →
            </Link>
          </div>
          
          <div className="course-grid">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* --- STATYSTYKI --- */}
      <section className="stats-section dark-stats">
        <div className="container stats-grid">
          <div className="stat-item">
            <h3>15k+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-item">
            <h3>20+</h3>
            <p>Cooperating Firms</p>
          </div>
          <div className="stat-item">
            <h3>95%</h3>
            <p>Satisfied Users</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
        </div>
      </section>

      {/* --- SEKCJA CTA (Z marginesem od statystyk) --- */}
      <section className="home-footer-cta">
  <div className="container">
    <div className="cta-box">
      <h2>Zacznij budować swoją przyszłość</h2>
      <p>Dołącz do naszej społeczności i zacznij swoją podróż w świat nauki i technologii.</p>
      <Link to="/register" className="btn-cta-gold">
        Stwórz darmowe konto
      </Link>
    </div>
  </div>
</section>
    </div>
  );
}