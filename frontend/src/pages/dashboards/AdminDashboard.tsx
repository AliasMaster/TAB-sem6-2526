import React, { useEffect, useState } from 'react';
import api from '../../api';

interface Course {
  id: string;
  title: string;
  isBlocked: boolean;
  status: any;
}

interface UserActivity {
  userId: string;
  username: string;
  totalForumPosts: number;
  totalThreadsStarted: number;
  totalLessonAccesses: number;
  coursesEnrolled: number;
}

interface CourseSales {
  courseId: string;
  courseTitle: string;
  accessesSold: number;
  totalRevenue: number;
}

interface CourseActivity {
  courseId: string;
  courseTitle: string;
  activeUsers: number;
  forumPosts: number;
  materialDownloads: number;
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [sales, setSales] = useState<CourseSales[]>([]);
  const [courseActivities, setCourseActivities] = useState<CourseActivity[]>([]);
  
  // Totals
  const [grandTotalRevenue, setGrandTotalRevenue] = useState(0);
  const [grandTotalAccesses, setGrandTotalAccesses] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'activity' | 'course-activity' | 'courses'>('overview');

  const [salesCourseTitle, setSalesCourseTitle] = useState('');
  const [activityUsername, setActivityUsername] = useState('');

  // Default dates: start of year to end of year for demo
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Find courseId if title matches
      const selectedCourseForSales = courses.find(c => c.title === salesCourseTitle);
      const courseIdParam = selectedCourseForSales ? `&courseId=${selectedCourseForSales.id}` : '';

      const [coursesRes, activityRes, salesRes, courseActivityRes] = await Promise.all([
        api.get('/catalog/courses'),
        api.get(`/reports/user-activity?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/reports/course-sales?startDate=${startDate}&endDate=${endDate}${courseIdParam}`),
        api.get(`/reports/course-activity?startDate=${startDate}&endDate=${endDate}`),
      ]);
      setCourses(coursesRes.data || []);
      setActivities(activityRes.data.rows || []);
      setSales(salesRes.data.rows || []);
      setCourseActivities(courseActivityRes.data.rows || []);
      setGrandTotalRevenue(salesRes.data.grandTotalRevenue || 0);
      setGrandTotalAccesses(salesRes.data.grandTotalAccessesSold || 0);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.response?.data ||
        err.message || 
        'Wystąpił nieoczekiwany błąd podczas pobierania danych.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id: string, currentlyBlocked: boolean) => {
    try {
      await api.put(`/catalog/courses/${id}/block?block=${!currentlyBlocked}`);
      setCourses(
        courses.map((c) =>
          c.id === id ? { ...c, isBlocked: !currentlyBlocked } : c,
        ),
      );
    } catch (err: any) {
      console.error(err);
      alert('Nie udało się zmienić statusu blokady kursu.');
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#c084fc' }}>
        <div style={{ width: 60, height: 60, border: '4px solid rgba(192,132,252,0.15)', borderTop: '4px solid #c084fc', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 500 }}>Ładowanie panelu...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const displayedActivities = activityUsername
    ? activities.filter(a => a.username.toLowerCase().includes(activityUsername.toLowerCase()))
    : activities;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container">
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.5rem 0' }}>
              Panel Administratora
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>Kompleksowe zarządzanie i analityka platformy</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'rgba(30, 41, 59, 0.7)', padding: '1rem', borderRadius: '16px', border: '1px solid #334155', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>Od daty</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>Do daty</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none' }} />
            </div>
            {activeTab === 'sales' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>Kurs (Sprzedaż)</label>
                <input 
                  list="courses-list" 
                  placeholder="Wszystkie kursy"
                  value={salesCourseTitle} 
                  onChange={e => setSalesCourseTitle(e.target.value)} 
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none', width: '200px' }} 
                />
                <datalist id="courses-list">
                  {courses.map(c => <option key={c.id} value={c.title} />)}
                </datalist>
              </div>
            )}
            {activeTab === 'activity' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>Użytkownik (Aktywność)</label>
                <input 
                  list="users-list" 
                  placeholder="Wszyscy użytkownicy"
                  value={activityUsername} 
                  onChange={e => setActivityUsername(e.target.value)} 
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none', width: '200px' }} 
                />
                <datalist id="users-list">
                  {activities.map(a => <option key={a.userId} value={a.username} />)}
                </datalist>
              </div>
            )}
            <button onClick={fetchData} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Aktualizuj
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', color: '#fca5a5', marginBottom: '2rem' }}>
            <strong>Błąd:</strong> {error}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: '📊 Przegląd' },
            { id: 'sales', label: '💰 Raport Sprzedaży' },
            { id: 'activity', label: '📈 Aktywność Użytkowników' },
            { id: 'course-activity', label: '📑 Aktywność wg Kursów' },
            { id: 'courses', label: '⚙️ Zarządzanie Kursami' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 600, transition: 'all 0.3s', cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#818cf8' : '#94a3b8',
                border: `1px solid ${activeTab === tab.id ? '#6366f1' : 'transparent'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#38bdf8' }}>📚</div>
              <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0', fontWeight: 600 }}>Łącznie Kursów</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{courses.length}</h2>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#ef4444' }}>🚫</div>
              <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0', fontWeight: 600 }}>Zablokowane Kursy</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{courses.filter(c => c.isBlocked).length}</h2>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#a855f7' }}>💰</div>
              <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0', fontWeight: 600 }}>Wygenerowany Przychód</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{grandTotalRevenue.toFixed(2)} <span style={{fontSize: '1.2rem', color: '#94a3b8'}}>PLN</span></h2>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#10b981' }}>📈</div>
              <p style={{ color: '#94a3b8', margin: '0 0 0.5rem 0', fontWeight: 600 }}>Pobrania Materiałów</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{activities.reduce((sum, a) => sum + a.totalLessonAccesses, 0)}</h2>
            </div>
          </div>
        )}

        {/* TAB: SALES REPORT */}
        {activeTab === 'sales' && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '20px', border: '1px solid #334155', padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', color: '#f1f5f9' }}>Raport Sprzedaży Szkoleń</h2>
                <p style={{ color: '#94a3b8', margin: 0 }}>Zestawienie liczby sprzedanych dostępów i przychodów dla każdego ze szkoleń.</p>
              </div>
              <div style={{ textAlign: 'right', background: 'rgba(15, 23, 42, 0.8)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #475569' }}>
                <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>Suma Przychodu z Okresu</p>
                <h3 style={{ margin: 0, color: '#a855f7', fontSize: '1.8rem' }}>{grandTotalRevenue.toFixed(2)} PLN</h3>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155' }}>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Nazwa Szkolenia</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Sprzedane Dostępy</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Przychód</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Brak danych o sprzedaży w wybranym okresie.</td></tr>
                  ) : (
                    sales.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#f1f5f9', fontWeight: 500 }}>{row.courseTitle}</td>
                        <td style={{ padding: '1rem', color: '#38bdf8', textAlign: 'center', fontWeight: 600 }}>{row.accessesSold}</td>
                        <td style={{ padding: '1rem', color: '#a855f7', textAlign: 'right', fontWeight: 600 }}>{row.totalRevenue.toFixed(2)} PLN</td>
                      </tr>
                    ))
                  )}
                  {sales.length > 0 && (
                    <tr style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                      <td style={{ padding: '1rem', color: '#f1f5f9', fontWeight: 800 }}>SUMA</td>
                      <td style={{ padding: '1rem', color: '#38bdf8', textAlign: 'center', fontWeight: 800 }}>{grandTotalAccesses}</td>
                      <td style={{ padding: '1rem', color: '#a855f7', textAlign: 'right', fontWeight: 800 }}>{grandTotalRevenue.toFixed(2)} PLN</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: USER ACTIVITY REPORT */}
        {activeTab === 'activity' && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '20px', border: '1px solid #334155', padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', color: '#f1f5f9' }}>Aktywność Użytkowników</h2>
              <p style={{ color: '#94a3b8', margin: 0 }}>Zestawienie liczby aktywnych użytkowników, wygenerowanych postów na forum oraz liczby pobrań materiałów elektronicznych.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155' }}>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Użytkownik</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Rozpoczęte Wątki</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Posty na Forum</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Pobrane Materiały (Lekcje)</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Zapisany na Kursy</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedActivities.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Brak aktywności w wybranym okresie dla podanego użytkownika.</td></tr>
                  ) : (
                    displayedActivities.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#f1f5f9', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {row.username.charAt(0).toUpperCase()}
                            </div>
                            {row.username}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'center' }}>{row.totalThreadsStarted}</td>
                        <td style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'center' }}>{row.totalForumPosts}</td>
                        <td style={{ padding: '1rem', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>{row.totalLessonAccesses}</td>
                        <td style={{ padding: '1rem', color: '#38bdf8', textAlign: 'center', fontWeight: 600 }}>{row.coursesEnrolled}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: COURSE ACTIVITY REPORT */}
        {activeTab === 'course-activity' && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '20px', border: '1px solid #334155', padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', color: '#f1f5f9' }}>Aktywność Użytkowników wg Kursów</h2>
              <p style={{ color: '#94a3b8', margin: 0 }}>Zestawienie liczby aktywnych użytkowników, pobrań materiałów oraz wygenerowanych przez nich postów z podziałem na szkolenia.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155' }}>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Kurs</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Aktywni Użytkownicy</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Pobrania Materiałów</th>
                    <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Wygenerowane Posty</th>
                  </tr>
                </thead>
                <tbody>
                  {courseActivities.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Brak aktywności w wybranym okresie.</td></tr>
                  ) : (
                    courseActivities.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#f1f5f9', fontWeight: 500 }}>{row.courseTitle}</td>
                        <td style={{ padding: '1rem', color: '#38bdf8', textAlign: 'center', fontWeight: 600 }}>{row.activeUsers}</td>
                        <td style={{ padding: '1rem', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>{row.materialDownloads}</td>
                        <td style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'center' }}>{row.forumPosts}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: COURSES MANAGEMENT */}
        {activeTab === 'courses' && (
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '20px', border: '1px solid #334155', padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.8rem', color: '#f1f5f9' }}>Zarządzanie Kursami</h2>
            
            {courses.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Brak dostępnych kursów w systemie.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155' }}>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Tytuł kursu</th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Zablokowany</th>
                      <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem', color: '#f1f5f9', fontWeight: 500 }}>{course.title}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.8rem', 
                            fontWeight: 600, 
                            backgroundColor: (course.status === 0 || course.status === 'Active' || course.status === '0') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: (course.status === 0 || course.status === 'Active' || course.status === '0') ? '#10b981' : '#ef4444' 
                          }}>
                            {(course.status === 0 || course.status === 'Active' || course.status === '0') ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {course.isBlocked ? (
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>Tak</span>
                          ) : (
                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Nie</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => toggleBlock(course.id, course.isBlocked)}
                            style={{
                              padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                              backgroundColor: course.isBlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: course.isBlocked ? '#10b981' : '#ef4444'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = course.isBlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = course.isBlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
                          >
                            {course.isBlocked ? 'Odblokuj' : 'Zablokuj'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
