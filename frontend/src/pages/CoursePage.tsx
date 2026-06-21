import React, { useState, useEffect } from 'react';
import api from '../api';
import CourseCard from '../components/CourseCard';
import '../assets/styles/catalog.css';

export default function CoursePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/catalog/courses');
      const mappedCourses = res.data
        .filter((c: any) => (c.status === 0 || c.status === 'Active' || c.status === '0' || c.status === 'active') && !c.isBlocked)
        .map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          longDescription: c.description,
          author: 'Company ' + (c.authorId ? c.authorId.substring(0, 5) : ''), // Mocked author name for now
          price: c.price,
          imageUrl: c.imageUrl || 'https://via.placeholder.com/400x250',
          rating: c.averageRating || 0,
        }));
      setCourses(mappedCourses);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
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
        {/* Pasek narzędziowy: Filtry i Szukajka */}
        <div className="catalog-controls">
          <div className="catalog-search">
            {/* Ikona lupki SVG */}
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Jakich umiejętności szukasz?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="results-info">
          Znaleziono: <span>{filteredCourses.length} kursów</span>
        </div>

        {/* Siatka Kursów */}
        {filteredCourses.length > 0 ? (
          <div className="course-grid">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <h3>Brak wyników</h3>
            <p>Spróbuj wpisać inne hasło wyszukiwania.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm('');
              }}>
              Wyczyść filtry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
