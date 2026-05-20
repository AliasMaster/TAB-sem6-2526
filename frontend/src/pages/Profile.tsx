import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import '../assets/styles/profilePage.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', color: '' });

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) navigate('/login');
    else {
      fetchUserData();
    }
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const [enrollRes, orderRes] = await Promise.all([
        api.get('/enrollments/my'),
        api.get('/orders/my')
      ]);
      setEnrollments(enrollRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefund = async (orderId: string) => {
    try {
      await api.post(`/orders/refund/${orderId}`);
      setMessage({ text: 'Zlecono zwrot środków!', color: '#2ecc71' });
      fetchUserData();
    } catch (err: any) {
      setMessage({ text: err.response?.data || 'Błąd podczas zwrotu.', color: '#ef4444' });
    }
  };

  if (!user) return null;

  const saveField = async (field: string, value: string) => {
    // API logic for profile update is missing on backend side, mocking it for now.
    setMessage({ text: 'Zaktualizowano profil', color: '#2ecc71' });
    if (field === 'password') setNewPassword('');
  };



  return (
    <div className="profile-page-wrapper">
      
      <section className="profile-hero">
        <div className="profile-container hero-flex">
          
          <div className="hero-text-side">
            <h1>Zarządzaj swoim kontem</h1>
            <p className="hero-subtitle">Przeglądaj swoje kursy, transakcje i ustawienia bezpieczeństwa.</p>
          </div>

        </div>
      </section>

      <section className="profile-main">
        {message.text && (
          <div style={{ backgroundColor: message.color, color: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
            {message.text}
          </div>
        )}

        <div className="profile-container settings-grid">
          
          <div className="profile-card">
            <h3 className="card-title">Bezpieczeństwo</h3>

            <div className="input-group">
              <label className="input-label">Hasło</label>
              <input className="profile-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="********" />
              {newPassword.length > 0 && (
                <div className="field-actions">
                  <button className="save-link" onClick={() => saveField('password', newPassword)}>Zmień</button>
                  <button className="cancel-link" onClick={() => setNewPassword('')}>Anuluj</button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-card" style={{ gridRow: 'span 2' }}>
            <h3 className="card-title">Twoje Kursy</h3>
            {enrollments.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {enrollments.map(e => (
                  <li key={e.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>Zapisany dnia: {new Date(e.enrolledAt).toLocaleDateString()}</span>
                      <Link to={`/lesson/${e.courseId}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Ucz się</Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak zapisów na kursy.</p>
            )}
            
            <h3 className="card-title" style={{ marginTop: '2rem' }}>Historia Płatności</h3>
            {orders.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {orders.map(o => (
                  <li key={o.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Kwota: {o.amount} PLN</strong><br />
                        <small>Status: {o.status} | Data: {new Date(o.createdAt).toLocaleDateString()}</small>
                      </div>
                      {o.status === 'Completed' && (
                        <button className="btn btn-login" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => handleRefund(o.id)}>
                          Zwrot (do 14 dni)
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak historii płatności.</p>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Profile;