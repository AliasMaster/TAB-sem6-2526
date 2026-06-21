import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import HlsVideoPlayer from '../components/HlsVideoPlayer';
import api from '../api';
import '../assets/styles/lesson.css';

export default function LessonSection() {
  const { id } = useParams<{ id: string }>(); // courseId
  const navigate = useNavigate();
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [textContent, setTextContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  // Reviews
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost/api';

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    checkCourseAndFetchData();
  }, [id]);

  const checkCourseAndFetchData = async () => {
    try {
      const courseRes = await api.get(`/catalog/courses/${id}`);
      if (courseRes.data.isBlocked) {
        setIsBlocked(true);
        return;
      }
      fetchLessonsAndProgress();
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        alert("Nie masz dostępu do tego kursu lub kurs nie istnieje.");
        navigate(`/course/${id}`);
      }
    }
  };

  const fetchLessonsAndProgress = async () => {
    try {
      const [lessonsRes, progRes] = await Promise.all([
        api.get(`/enrollments/course/${id}/lessons`),
        api.get(`/enrollments/course/${id}/progress`)
      ]);
      const mappedLessons = lessonsRes.data.map((l: any) => ({
        id: l.id,
        orderIndex: l.order,
        title: l.title.replace(/\[(.*?)\] /, ''),
        type: l.title.match(/\[(.*?)\]/)?.[1] || 'Text',
        contentUrl: l.contentUrl
      }));
      setLessons(mappedLessons);
      setProgress(progRes.data);
      if (mappedLessons.length > 0) {
        handleSelectLesson(mappedLessons[0]);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const isCompleted = (lessonId: string) => progress.some(p => p.lessonId === lessonId);

  const handleSelectLesson = async (lesson: any) => {
    setActiveLesson(lesson);
    setTextContent('');
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }

    if (lesson.type === 'Text') {
      setTextContent(lesson.contentUrl || '');
    } else if (lesson.type === 'Document') {
      try {
        const res = await api.get(`/courses/${id}/lessons/${lesson.id}/content/document.pdf`, {
          responseType: 'blob'
        });
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("Failed to load PDF", err);
      }
    }
  };

  const markCompleted = async () => {
    if (!activeLesson) return;
    try {
      await api.post(`/enrollments/course/${id}/lessons/${activeLesson.id}/complete`);
      const progRes = await api.get(`/enrollments/course/${id}/progress`);
      setProgress(progRes.data);
      
      const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
      if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
        handleSelectLesson(lessons[currentIndex + 1]);
      } else {
        alert("Gratulacje, ukończyłeś wszystkie lekcje!");
      }
    } catch (err) {
      console.error("Error marking as completed", err);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/catalog/courses/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewMessage('Opinia dodana pomyślnie!');
      setReviewComment('');
    } catch (err: any) {
      setReviewMessage(err.response?.data?.message || err.response?.data || 'Błąd przy dodawaniu opinii.');
    }
  };

  const renderContent = () => {
    if (!activeLesson) return null;

    if (activeLesson.type === 'Text') {
      return (
        <div data-color-mode="light" style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '15px', color: 'black' }}>
          <MDEditor.Markdown source={textContent} />
          <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%', padding: '1rem', fontWeight: 'bold' }} onClick={markCompleted}>
            Zakończ Lekcję i Przejdź Dalej
          </button>
        </div>
      );
    }

    if (activeLesson.type === 'Video') {
      const token = localStorage.getItem('accessToken') || '';
      const hlsSrc = `${baseURL}/courses/${id}/lessons/${activeLesson.id}/content/`;
      return (
        <div style={{ borderRadius: '15px', overflow: 'hidden', backgroundColor: 'black', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <HlsVideoPlayer src={hlsSrc} token={token} onEnded={markCompleted} height="500px" />
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(30, 41, 59, 0.9)' }}>
            <button className="btn btn-primary" onClick={markCompleted}>
              Zakończ Lekcję
            </button>
          </div>
        </div>
      );
    }

    if (activeLesson.type === 'Document') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '650px', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '1.5rem', borderRadius: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'white' }}>Dokument PDF</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {pdfUrl && (
                <a href={pdfUrl} download={`${activeLesson.title}.pdf`} className="btn btn-login" style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px' }}>
                  Pobierz PDF
                </a>
              )}
              <button className="btn btn-primary" onClick={markCompleted} style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px' }}>
                Zaznacz jako ukończone
              </button>
            </div>
          </div>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF Viewer"
              width="100%"
              height="100%"
              style={{ border: 'none', borderRadius: '10px', backgroundColor: '#374151' }}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              Ładowanie dokumentu PDF...
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container" style={{ display: 'flex', gap: '2rem', flexDirection: 'row', alignItems: 'flex-start' }}>
        
        {isBlocked ? (
          <div style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
            <h1 style={{ color: '#f87171', marginBottom: '1rem', fontSize: '2.5rem' }}>Kurs Zablokowany</h1>
            <p style={{ color: '#fca5a5', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
              Ten kurs został zablokowany przez administratora z powodu naruszenia regulaminu lub prac technicznych. Dostęp do materiałów jest tymczasowo wstrzymany.
            </p>
            <button className="btn btn-primary" onClick={() => navigate(`/course/${id}`)} style={{ marginTop: '2rem', padding: '1rem 2rem' }}>
              Wróć do strony kursu
            </button>
          </div>
        ) : (
          <>
            {/* LEWA KOLUMNA: MENU LEKCJI & OPINIE */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '100px' }}>
              
              <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#a855f7' }}>📑</span> Spis Treści
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '50vh', overflowY: 'auto' }}>
                  {lessons.map((lesson) => (
                    <li 
                      key={lesson.id} 
                      onClick={() => handleSelectLesson(lesson)}
                      style={{ 
                        padding: '1rem 1.2rem', 
                        cursor: 'pointer', 
                        backgroundColor: activeLesson?.id === lesson.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        borderLeft: activeLesson?.id === lesson.id ? '4px solid #6366f1' : '4px solid transparent',
                        color: activeLesson?.id === lesson.id ? '#818cf8' : '#cbd5e1',
                        borderBottom: '1px solid #1e293b',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseOver={(e) => {
                        if (activeLesson?.id !== lesson.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                          e.currentTarget.style.color = '#f1f5f9';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (activeLesson?.id !== lesson.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#cbd5e1';
                        }
                      }}
                    >
                      <span style={{ fontWeight: activeLesson?.id === lesson.id ? 600 : 400 }}>{lesson.orderIndex}. {lesson.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isCompleted(lesson.id) && (
                          <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>✓</span>
                        )}
                        <span style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
                          {lesson.type}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#f59e0b' }}>⭐</span> Oceń Kurs
                </h3>
                {reviewMessage && <p style={{ color: '#10b981', marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid #10b981' }}>{reviewMessage}</p>}
                
                <form onSubmit={submitReview}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    {[1,2,3,4,5].map(star => (
                      <span 
                        key={star} 
                        onClick={() => setReviewRating(star)}
                        style={{ 
                          cursor: 'pointer', 
                          color: star <= reviewRating ? '#f59e0b' : '#475569',
                          fontSize: '1.8rem',
                          transition: 'color 0.2s'
                        }}>
                        ★
                      </span>
                    ))}
                  </div>
                  
                  <textarea 
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Co sądzisz o tym kursie?"
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      border: '1px solid #475569', 
                      backgroundColor: '#0f172a', 
                      color: '#f1f5f9',
                      marginBottom: '1rem',
                      minHeight: '100px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                  <button 
                    type="submit"
                    className="btn btn-primary" 
                    style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
                    Wyślij Opinię
                  </button>
                </form>
              </div>

            </div>

            {/* PRAWA KOLUMNA: TREŚĆ LEKCJI */}
            <div style={{ flex: '2.5', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2.5rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', minHeight: '600px' }}>
                <h2 style={{ margin: '0 0 2rem 0', color: '#f1f5f9', fontSize: '2.2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                  {activeLesson ? activeLesson.title : 'Wybierz lekcję z menu'}
                </h2>
                {renderContent()}
              </div>
            </div>
          </>
        )}

      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}