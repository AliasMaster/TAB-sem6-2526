import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../App';
import '../assets/styles/profilePage.css'; // Importujemy styl

interface ProfileProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const Profile = ({ user, setUser }: ProfileProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const [tempEmail, setTempEmail] = useState(user?.email || '');
  const [tempLogin, setTempLogin] = useState(user?.login || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileImage, setProfileImage] = useState(user?.profilePic || null);
  const [hasNewPhoto, setHasNewPhoto] = useState(false);
  const [message, setMessage] = useState({ text: '', color: '' });

  if (!user) return null;
const saveField = async (field: keyof User | 'password', value: string) => {
    if (!user) return;

    if (field === 'login') {
    if (value.length < 4) {
      setMessage({ text: 'Login musi mieć co najmniej 4 znaki.', color: '#ef4444' });
      return;
    }
  }

  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setMessage({ text: 'Podaj poprawny adres e-mail.', color: '#ef4444' });
      return;
    }
  }

  if (field === 'password') {
    if (value.length < 6) {
      setMessage({ text: 'Hasło musi mieć co najmniej 6 znaków.', color: '#ef4444' });
      return;
    }
  }
    // Przygotowujemy paczkę danych do wysłania. 
    // Wysyłamy ID użytkownika i TYLKO to pole, które zmieniamy.
    const payload = {
      id: user.id,
      newLogin: field === 'login' ? value : undefined,
      newEmail: field === 'email' ? value : undefined,
      newPassword: field === 'password' ? value : undefined,
    };
    const showMessage = (text: string, color: string) => {
    setMessage({ text, color });
    // Automatyczne znikanie po 4 sekundach
    setTimeout(() => setMessage({ text: '', color: '' }), 4000);
  };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (response.ok) {
        if (field === 'password') {
          setNewPassword('');
          setMessage({ text: 'Hasło zmienione pomyślnie!', color: '#2ecc71' });
        } else {
          setUser({ ...user, [field]: value }); // Zapisujemy w stanie Reacta dopiero po potwierdzeniu z bazy
          setMessage({ text: 'Dane zapisane!', color: '#2ecc71' });
        }
      } else {
        const errorMsg = await response.text();
        setMessage({ text: errorMsg || 'Błąd zapisu.', color: '#ef4444' });
        // Jeśli błąd loginu, cofamy input do poprzedniej wartości
        if (field === 'login') setTempLogin(user.login);
        if (field === 'email') setTempEmail(user.email);
      }
    } catch (error) {
      console.error("Błąd połączenia", error);
      setMessage({ text: 'Błąd połączenia z serwerem.', color: '#ef4444' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setHasNewPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  };
const savePhoto = async () => {
  if (user && profileImage) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          newProfilePic: profileImage // Wysyłamy base64 do bazy
        }),
        credentials: 'include'
      });

      if (response.ok) {
        setUser({ ...user, profilePic: profileImage });
        setHasNewPhoto(false);
        setMessage({ text: 'Zdjęcie profilowe zostało zaktualizowane!', color: '#2ecc71' });
      } else {
        setMessage({ text: 'Błąd podczas zapisywania zdjęcia.', color: '#ef4444' });
      }
    } catch (error) {
      setMessage({ text: 'Błąd połączenia z serwerem.', color: '#ef4444' });
    }
  }
};

  return (
    <div className="profile-page-wrapper">
      
      <section className="profile-hero">
        <div className="profile-container hero-flex">
          
          {/* LEWA STRONA: TEKST */}
          <div className="hero-text-side">
            <h1>Witaj, {user.login}!</h1>
            <p className="hero-subtitle">Zarządzaj swoimi danymi i ustawieniami bezpieczeństwa.</p>
          </div>

          {/* PRAWA STRONA: AWATAR */}
          <div className="hero-avatar-side">
            <div className="avatar-container">
              <div className="avatar-large" onClick={() => fileInputRef.current?.click()}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" />
                ) : (
                  <span className="avatar-letter">{user.login.charAt(0).toUpperCase()}</span>
                )}
                <div className="avatar-overlay">Zmień zdjęcie</div>
              </div>
              
              {/* Przycisk Zastosuj teraz elegancko ląduje pod kółkiem na prawo */}
              {hasNewPhoto && (
                <button onClick={savePhoto} className="btn-apply">Zastosuj</button>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{display:'none'}} />
          </div>

        </div>
      </section>
       {message.text && (
  <div className="profile-container">
    <div className="status-message" style={{ backgroundColor: message.color + '22', color: message.color, borderColor: message.color }}>
      <span className="status-icon">{message.color === '#2ecc71' ? '✓' : '✕'}</span>
      {message.text}
    </div>
  </div>
)}        
      <section className="profile-main">
        <div className="profile-container settings-grid">
          
          <div className="profile-card">
            <h3 className="card-title">Dane osobowe</h3>
            
            <div className="input-group">
              <label className="input-label">Login</label>
              <input className="profile-input" type="text" value={tempLogin} onChange={(e) => setTempLogin(e.target.value)} />
              {tempLogin !== user.login && (
                <div className="field-actions">
                  <button className="save-link" onClick={() => saveField('login', tempLogin)}>Zapisz</button>
                  <button className="cancel-link" onClick={() => setTempLogin(user.login)}>Anuluj</button>
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input className="profile-input" type="email" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} />
              {tempEmail !== user.email && (
                <div className="field-actions">
                  <button className="save-link" onClick={() => saveField('email', tempEmail)}>Zapisz</button>
                  <button className="cancel-link" onClick={() => setTempEmail(user.email)}>Anuluj</button>
                </div>
              )}
            </div>

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

          <div className="profile-card">
            <h3 className="card-title">Status konta</h3>
            <div className="status-item"><span>Rola:</span> <span className="role-badge">{user.role}</span></div>
            <div className="status-item"><span>Uczeń od:</span> <strong>Kwiecień 2026</strong></div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Profile;