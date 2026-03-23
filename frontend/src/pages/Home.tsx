import { courses } from '../data'; 
import CourseCard from '../components/CourseCard';

export default function HomePage() {
  return (
    <div className="home-page">
      {/* SEKCJA HERO NA PEŁNĄ SZEROKOŚĆ */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Rozwijaj swoje pasje <br /> z <span>najlepszymi ekspertami</span>.
          </h1>
          <p className="hero-subtitle">
            Odkryj tysiące kursów programowania, designu i biznesu. Zacznij naukę już dziś.
          </p>
        </div>
      </section>

      {/* KATALOG KURSÓW W KONTENERZE */}
      <section className="courses-section">
        <div className="container">
          <h2 className="section-title">Nowości na platformie</h2>
          
          <div className="course-grid">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}