import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from '../App';
import { courses } from '../data';
import '../assets/styles/reports.css';

interface ReportsProps {
  user: User | null;
}

const MOCK_USERS = [
  { id: 1, login: 'admin', email: 'admin@eduforge.com', role: 'Admin' },
  { id: 2, login: 'client', email: 'client@eduforge.com', role: 'Client' },
  { id: 3, login: 'firm', email: 'firm@eduforge.com', role: 'Firm' },
];

export default function Reports({ user }: ReportsProps) {
  // Zabezpieczenie na poziomie komponentu - upewniamy się podwójnie
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  const [reportType, setReportType] = useState<'sales' | 'activity'>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<any[] | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (reportType === 'sales' && selectedCourseId) params.append('courseId', selectedCourseId);
      if (reportType === 'activity' && selectedUserId) params.append('userId', selectedUserId);

      const url = `http://localhost/api/reports/${reportType}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'X-User-Role': 'Admin' }
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Brak uprawnień do przeglądania raportów.');
        } else {
          setError(`Błąd serwera: ${response.status} ${response.statusText}`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (reportType === 'sales') {
        setResults(data.map((item: any) => ({
          ...item,
          courseName: courses.find(c => c.id === item.courseId)?.title || `Szkolenie ID: ${item.courseId}`
        })));
      } else {
        setResults(data);
      }

    } catch (err) {
      console.error(err);
      setError('Nie można połączyć się z serwerem. Upewnij się, że backend (Docker) jest uruchomiony.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-page-wrapper">
      <div className="reports-container">
        
        <header className="reports-header">
          <h1>Centrum Raportów</h1>
          <p>Generuj zestawienia statystyczne dla platformy EduForge</p>
        </header>

        <section className="reports-controls">
          <div className="controls-row">
            <div className="input-group">
              <label>Typ Raportu</label>
              <select 
                className="reports-select" 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value as 'sales' | 'activity')}
              >
                <option value="sales">1. Zestawienie sprzedaży szkoleń</option>
                <option value="activity">2. Aktywność użytkowników</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Data od</label>
              <input 
                type="date" 
                className="reports-input" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>

            <div className="input-group">
              <label>Data do</label>
              <input 
                type="date" 
                className="reports-input" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>

            {reportType === 'sales' && (
              <div className="input-group">
                <label>Konkretne szkolenie (opcjonalnie)</label>
                <select 
                  className="reports-select" 
                  value={selectedCourseId} 
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="">-- Wszystkie szkolenia --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'activity' && (
              <div className="input-group">
                <label>Konkretny użytkownik (opcjonalnie)</label>
                <select 
                  className="reports-select" 
                  value={selectedUserId} 
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- Wszyscy użytkownicy --</option>
                  {MOCK_USERS.map(u => (
                    <option key={u.id} value={u.id}>{u.login}</option>
                  ))}
                </select>
              </div>
            )}

            <button 
              className="generate-btn" 
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? 'Generowanie...' : 'Generuj Raport'}
            </button>
          </div>
        </section>

        <section className="reports-results">
          <div className="results-header">
            <h2>
              {reportType === 'sales' 
                ? 'Wyniki Zestawienia Sprzedaży' 
                : 'Wyniki Aktywności Użytkowników'}
            </h2>
          </div>

          {error && <div className="reports-message error">{error}</div>}
          
          {!loading && !results && !error && (
            <div className="no-data">Wybierz parametry i kliknij "Generuj Raport" aby zobaczyć wyniki.</div>
          )}

          {!loading && results && results.length === 0 && (
            <div className="no-data">Brak danych dla wybranego okresu.</div>
          )}

          {!loading && results && results.length > 0 && (
            <div style={{overflowX: 'auto'}}>
              <table className="reports-table">
                {reportType === 'sales' ? (
                  <>
                    <thead>
                      <tr>
                        <th>Nazwa Szkolenia</th>
                        <th>Liczba Sprzedanych Dostępów</th>
                        <th>Sumaryczny Przychód</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.courseName}</td>
                          <td>{row.accessesSold} szt.</td>
                          <td style={{ color: '#4ade80', fontWeight: 'bold' }}>{row.totalRevenue} zł</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead>
                      <tr>
                        <th>Użytkownik</th>
                        <th>Napisane posty (Forum)</th>
                        <th>Wpisy w Księdze Gości</th>
                        <th>Pobrane Materiały</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, idx) => (
                        <tr key={idx}>
                          <td><strong>{row.userName || `User ${row.userId}`}</strong></td>
                          <td>{row.forumPostsCount}</td>
                          <td>{row.guestBookEntriesCount}</td>
                          <td>{row.downloadsCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
