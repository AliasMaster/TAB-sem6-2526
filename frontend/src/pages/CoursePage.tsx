import React, { useState } from 'react';
import { courses } from '../data'; 
import CourseCard from '../components/CourseCard';
import '../assets/styles/catalog.css'; 

export default function CoursePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Wszystkie');

  const categories = ['Wszystkie', 'Programowanie', 'Design', 'Biznes'];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'Wszystkie' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <div className="container">
          <h1>Eksploruj Kursy</h1>
          <p>Znajdź wiedzę, której potrzebujesz, by wejść na wyższy poziom.</p>
        </div>
      </header>

      <div className="container">
        <div className="catalog-controls">
          <div className="filter-buttons">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="catalog-search">
            <input 
              type="text" 
              placeholder="Czego szukasz?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="results-info">
          Znaleziono: <span>{filteredCourses.length} kursów</span>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="course-grid">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <h3>Brak wyników dla Twojego wyszukiwania.</h3>
          </div>
        )}
      </div>
    </div>
  );
}