import { useParams } from 'react-router-dom';
import { courses } from '../data';
import '../assets/styles/coursedetail.css'; 

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const course = courses.find(c => c.id.toString() === id);

  if (!course) {
    return <h1 style={{textAlign: 'center', marginTop: '5rem'}}>Kurs nie znaleziony</h1>;
  }

  return (
    <div>
      {/* Górny baner na pełną szerokość */}
      <section className="detail-hero">
        <div className="container detail-hero-content">
          <img src={course.imageUrl} alt={course.title} className="detail-image" />
          <div className="detail-info">
            <h1 className="detail-title">{course.title}</h1>
            <p style={{fontSize: '1.2rem', marginBottom: '1rem'}}>{course.longDescription}</p>
            <p>Autor: <strong>{course.author}</strong></p>
            
            <div className="detail-price-section">
              <span className="detail-price">{course.price} zł</span>
              <button className="btn btn-primary" style={{fontSize: '1.2rem', padding: '1rem 3rem'}}>
                Kup Kurs (F5)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja programu (F6 Materiały edukacyjne) */}
      <section className="container syllabus-section">
        <div>
          <h2>O czym jest ten kurs?</h2>
          <p style={{marginTop: '1rem', color: '#64748b'}}>Szczegółowy opis kursu ze specyfikacji...</p>
        </div>

        <div style={{background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
          <h3 style={{marginBottom: '1.5rem'}}>Program Kursu</h3>
          {course.modules?.map(module => (
            <div key={module.id} className="module">
              <h4 className="module-title">{module.title}</h4>
              <div>
                {module.lessons.map(lesson => (
                  <div key={lesson.id} className="lesson">
                    <span>{lesson.title}</span>
                    <span style={{color: '#64748b'}}>{lesson.durationMinutes} min</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}