import { Link } from 'react-router-dom';
import type { Course } from '../types';

interface Props {
  course: Course;
}

export default function CourseCard({ course }: Props) {
  return (
    <div className="course-card">
      <div className="card-image-wrapper">
        <img src={course.imageUrl} alt={course.title} className="card-image" />
        <span className="card-category">{course.category}</span>
      </div>

      <div className="card-content">
        <div className="card-header">
          <span>{course.author}</span>
          <span style={{color: '#f59e0b', fontWeight: 'bold'}}>⭐ {course.rating}</span>
        </div>
        
        <h3 className="card-title">{course.title}</h3>
        <p className="card-description">{course.description}</p>
        
        <div className="card-footer">
          <span className="card-price">{course.price} zł</span>
          <Link to={`/course/${course.id}`} className="btn btn-primary">
            Zobacz Kurs
          </Link>
        </div>
      </div>
    </div>
  );
}