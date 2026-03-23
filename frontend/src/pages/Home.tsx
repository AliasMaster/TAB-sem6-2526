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
          <div className="hero-content">
            <span className="badge">Nowość: Kursy AI 2026</span>
            <h1 className="hero-title">
              Rozwijaj swoje pasje <br /> z <span>najlepszymi ekspertami</span>.
            </h1>
            <p className="hero-subtitle">
              Dołącz do 15 000+ studentów i zdobądź certyfikaty uznawane przez największe firmy technologiczne na świecie.
            </p>
            <div className="hero-btns">
              <Link to="/katalog" className="btn btn-primary">Przeglądaj Kursy</Link>
              <Link to="/about" className="btn btn-outline">Dowiedz się więcej</Link>
            </div>
          </div>

          <div className="hero-image-placeholder">
            <div className="abstract-shape"></div>
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
            <p>Studentów</p>
          </div>
          <div className="stat-item">
            <h3>200+</h3>
            <p>Instruktorów</p>
          </div>
          <div className="stat-item">
            <h3>95%</h3>
            <p>Sukcesów</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Pomocy</p>
          </div>
        </div>
      </section>

      {/* --- SEKCJA CTA (Z marginesem od statystyk) --- */}
      <section className="home-footer-cta" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="cta-box" style={{ textAlign: 'center' }}>
            <h2>Zacznij budować swoją przyszłość</h2>
            <p>Dołącz do naszej społeczności i zacznij swoją podróż w świat nauki i technologii.</p>
            <Link to="/register" className="btn btn-primary btn-large">Stwórz darmowe konto</Link>
          </div>
        </div>
      </section>
    </div>
  );
}