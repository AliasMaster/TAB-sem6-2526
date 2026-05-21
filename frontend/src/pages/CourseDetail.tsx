import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../assets/styles/coursedetail.css';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    fetchCourseDetails();
    if (userRole === 'User') {
      checkEnrollment();
    }
  }, [id, userRole]);

  const checkEnrollment = async () => {
    try {
      const res = await api.get('/enrollments/my');
      setIsEnrolled(res.data.some((e: any) => e.courseId === id));
    } catch {
      // ignore
    }
  };

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`/catalog/courses/${id}`);
      setCourse(res.data);
      try {
        const matRes = await api.get(`/catalog/courses/${id}/materials`);
        setMaterials(matRes.data || []);
      } catch {
        // user might not have access to materials
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchaseStatus('Rozpoczynanie transakcji...');
      const orderRes = await api.post('/orders/purchase', {
        courseId: id,
        amount: course.price ?? 0,
      });
      // Backend returns a Payment entity with property "id" (not "paymentId")
      const paymentId = orderRes.data.id;

      setPurchaseStatus('Przetwarzanie płatności...');
      await api.post(`/orders/process-payment/${paymentId}`);

      setPurchaseStatus('Płatność zakończona sukcesem!');
      setTimeout(() => {
        setCheckoutModal(false);
        navigate(`/lesson/${id}`);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message || 'Wystąpił błąd podczas płatności.';
      setPurchaseStatus(msg);
    }
  };

  if (loading) {
    return (
      <h1 style={{ textAlign: 'center', marginTop: '5rem' }}>Ładowanie...</h1>
    );
  }

  if (!course) {
    return (
      <h1 style={{ textAlign: 'center', marginTop: '5rem' }}>
        Kurs nie znaleziony
      </h1>
    );
  }

  return (
    <div className="course-detail-page-wrapper">
      <section className="detail-hero">
        <div className="container detail-hero-content">
          <img
            src={course.imageUrl || 'https://via.placeholder.com/400x250'}
            alt={course.title}
            className="detail-image"
          />
          <div className="detail-info">
            <h1 className="detail-title">{course.title}</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              {course.description}
            </p>
            <p>
              Ocena:{' '}
              <strong style={{ color: '#f59e0b' }}>
                ⭐ {course.averageRating?.toFixed(2) || 0} (
                {course.reviewCount || 0} ocen)
              </strong>
            </p>

            <div className="course-action-card">
              <div className="course-price">
                <span className="price-value">{course.price}</span>
                <span className="price-currency">PLN</span>
              </div>
              {course.isBlocked ? (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    padding: '1rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    color: '#ef4444',
                    fontWeight: 600,
                  }}>
                  🚫 Ten kurs został zablokowany przez administratora i jest
                  obecnie niedostępny.
                </div>
              ) : userRole !== 'User' ? (
                <button
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }}>
                  Tylko dla kursantów
                </button>
              ) : isEnrolled ? (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  onClick={() => navigate(`/lesson/${id}`)}>
                  Przejdź do nauki
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  onClick={() => setCheckoutModal(true)}>
                  Kup Teraz
                </button>
              )}
              <div className="guarantee">✓ 30 dni na zwrot pieniędzy</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container syllabus-section">
        <div className="description-container">
          <span className="description-badge">Szczegóły Programu</span>
          <h2>O czym jest ten kurs?</h2>
          <div className="description-content-wrapper">
            <p className="description-text">
              {course.longDescription || course.description || 'Brak opisu'}
            </p>
            <div className="feature-highlights">
              <div className="feature-tag">
                <div className="feature-icon">✓</div>
                <span className="feature-text">Projekty Real-World</span>
              </div>
              <div className="feature-tag">
                <div className="feature-icon">★</div>
                <span className="feature-text">Certyfikat Premium</span>
              </div>
              <div className="feature-tag">
                <div className="feature-icon">♾</div>
                <span className="feature-text">Dożywotni Dostęp</span>
              </div>
              <div className="feature-tag">
                <div className="feature-icon">🗂</div>
                <span className="feature-text">Zasoby do pobrania</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#111827' }}>
            Program Kursu
          </h3>
          <div className="module">
            <div>
              {materials.length > 0 ? (
                materials.map((lesson) => (
                  <div key={lesson.id} className="lesson">
                    <span>
                      {lesson.orderIndex}. {lesson.title}
                    </span>
                    <span style={{ color: '#64748b' }}>[{lesson.type}]</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b' }}>
                  Zapisz się, by zobaczyć pełną listę materiałów.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MODAL CHECKOUTU */}
      {checkoutModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
          <div
            style={{
              backgroundColor: '#1f2937',
              padding: '3rem',
              borderRadius: '15px',
              maxWidth: '500px',
              width: '100%',
              color: 'white',
              textAlign: 'center',
            }}>
            <h2 style={{ marginBottom: '1rem' }}>Podsumowanie Zamówienia</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
              {course.title} - <strong>{course.price} PLN</strong>
            </p>
            <p style={{ marginBottom: '2rem', color: '#f6ad55' }}>
              {purchaseStatus}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
              }}>
              <button
                className="btn btn-login"
                onClick={() => setCheckoutModal(false)}
                disabled={purchaseStatus !== ''}>
                Anuluj
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePurchase}
                disabled={purchaseStatus !== ''}>
                Zatwierdź Płatność
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
