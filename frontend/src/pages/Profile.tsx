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

  const saveField = (field: keyof User | 'password', value: string) => {
    if (field === 'password') {
      setNewPassword('');
    } else {
      setUser({ ...user, [field]: value });
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

  const savePhoto = () => {
    if (user && profileImage) {
      setUser({ ...user, profilePic: profileImage });
      setHasNewPhoto(false);
      setMessage({ text: 'Zdjęcie zapisane!', color: '#2ecc71' });
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