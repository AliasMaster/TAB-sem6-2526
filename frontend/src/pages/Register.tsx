import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { User } from '../App'; // Importujemy typ User

interface RegisterProps {
  setUser: (user: User | null) => void;
}

const Register = ({ setUser }: RegisterProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  const TAKEN_EMAILS = ['admin@eduforge.com', 'client@eduforge.com', 'firm@eduforge.com'];
  const TAKEN_LOGINS = ['admin', 'client', 'firm', 'client_test', 'firm_test'];

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (val.length === 0) {
      setIsUsernameTaken(false);
      return;
    }
    const exists = TAKEN_LOGINS.includes(val.toLowerCase().trim());
    setIsUsernameTaken(exists);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isUsernameTaken || TAKEN_EMAILS.includes(email.toLowerCase().trim())) {
      setError("Account already exists! Use a different email or login here.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (password.length < 6) {
      setError("Password is too short (min. 6 characters).");
      return;
    }

    // --- LOGIKA AUTOMATYCZNEGO LOGOWANIA ---
    // Tworzymy obiekt nowego użytkownika (zawsze jako Client)
    const newUser: User = {
      id: Date.now(), // Generujemy tymczasowe ID na podstawie czasu
      login: username,
      email: email,
      role: 'Client',
      profilePic: profileImage
    };

    // Zapisujemy go w stanie aplikacji
    setUser(newUser);

    // Przekierowujemy na stronę główną
    navigate('/'); 
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.glowBgLeft}></div>
      <div style={styles.glowBgRight}></div>

      <div style={styles.mainContent}>
        <div style={styles.sideColumn}>
          <div style={styles.brandWrapper}>
            <h1 style={styles.brandTitle}>Join the <span style={styles.brandHighlight}>Forge</span></h1>
            <p style={styles.brandSubtitle}>Create your profile and start learning.</p>
          </div>
        </div>

        <div style={styles.registerCard}>
          <h2 style={styles.cardTitle}>Create Account</h2>
          
          <form onSubmit={handleRegister} style={styles.formContainer}>
            <div style={styles.formColumns}>
              
              <div style={styles.leftFormColumn}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="e.g. MasterCoder"
                    style={{
                      ...styles.input,
                      borderColor: isUsernameTaken ? '#ef4444' : (username.length > 2 ? '#22c55e' : '#e5e7eb')
                    }}
                    required
                  />
                  {username.length > 0 && (
                    <small style={{
                      display: 'block', marginTop: '4px', fontWeight: '700', fontSize: '0.75rem',
                      color: isUsernameTaken ? '#ef4444' : '#22c55e', textAlign: 'left'
                    }}>
                      {isUsernameTaken ? '✖ Username already taken' : '✔ Username available'}
                    </small>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.rightFormColumn}>
                <div style={styles.photoUploadWrapper}>
                  <label style={styles.label}>Profile Picture (Optional)</label>
                  <div 
                    style={{
                      ...styles.photoPreview, 
                      backgroundImage: profileImage ? `url(${profileImage})` : 'none' 
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {!profileImage && <span style={{fontSize: '3rem', opacity: 0.3}}>+</span>}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    style={{display: 'none'}} 
                  />
                  <button type="button" style={styles.uploadFileBtn} onClick={() => fileInputRef.current?.click()}>
                    {profileImage ? "Change photo" : "Choose file"}
                  </button>
                  {profileImage && (
                    <button type="button" style={styles.removePhotoBtn} onClick={() => setProfileImage(null)}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.bottomSection}>
              {error && (
                <div style={styles.errorBox}>
                  {error.includes("Login here") ? (
                    <>Account exists! <Link to="/login" style={styles.errorLink}>Login here</Link></>
                  ) : error}
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={styles.registerButton}>
                Join Now
              </button>
            </div>
          </form>

          <div style={styles.loginPrompt}>
            Already a member? <Link to="/login" style={styles.loginLink}>Login here</Link>
          </div>
        </div>

        <div style={styles.sideColumn}>
          <div style={styles.promoWrapper}>
            <p style={styles.quoteText}>"The best way to predict the future is to create it."</p>
            <div style={styles.badgePromo}>GET CERTIFIED</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLE ---
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: { minHeight: 'calc(100vh - 70px)', backgroundColor: '#0c111e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif' },
  glowBgLeft: { position: 'absolute', width: '40vw', height: '80vh', background: 'radial-gradient(circle at center, rgba(246, 173, 85, 0.12) 0%, rgba(12, 17, 30, 0) 70%)', top: '10%', left: '-10%', zIndex: 1, },
  glowBgRight: { position: 'absolute', width: '40vw', height: '80vh', background: 'radial-gradient(circle at center, rgba(246, 173, 85, 0.08) 0%, rgba(12, 17, 30, 0) 70%)', bottom: '10%', right: '-10%', zIndex: 1, },
  mainContent: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1400px', zIndex: 10, flexWrap: 'nowrap' },
  sideColumn: { flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '0' },
  brandWrapper: { textAlign: 'center' },
  brandTitle: { fontSize: '2.4rem', fontWeight: 'bold' },
  brandHighlight: { color: '#f6ad55' },
  brandSubtitle: { fontSize: '1.1rem', opacity: 0.8, marginTop: '1rem', maxWidth: '220px', textAlign: 'center' },
  promoWrapper: { textAlign: 'center' },
  quoteText: { fontStyle: 'italic', fontSize: '1.1rem', maxWidth: '220px' },
  badgePromo: { backgroundColor: '#f6ad55', color: '#0c111e', padding: '0.5rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.8rem', marginTop: '1rem', display: 'inline-block' },
  registerCard: { flex: '0 0 750px', backgroundColor: '#ffffff', padding: '3rem', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 20, textAlign: 'center', border: '4px solid #f6ad55' },
  cardTitle: { color: '#111827', fontSize: '2.4rem', marginBottom: '2.5rem', fontWeight: '800' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  formColumns: { display: 'flex', flexDirection: 'row', gap: '3rem', alignItems: 'flex-start' },
  leftFormColumn: { flex: '1.2', display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  rightFormColumn: { flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  inputGroup: { textAlign: 'left', width: '100%' },
  label: { display: 'block', color: '#374151', fontWeight: '700', marginBottom: '0.4rem', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.85rem', borderRadius: '10px', border: '2px solid #e5e7eb', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f9fafb', transition: '0.2s' },
  photoUploadWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  photoPreview: { width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: '4px dashed #d1d5db', cursor: 'pointer', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadFileBtn: { backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  removePhotoBtn: { background: 'none', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', marginTop: '-0.5rem' },
  bottomSection: { display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' },
  registerButton: { width: '100%', padding: '1.2rem', fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer', border: 'none', borderRadius: '12px', textTransform: 'uppercase' },
  errorBox: { backgroundColor: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #fee2e2' },
  errorLink: { color: '#f6ad55', textDecoration: 'none', fontWeight: '700' },
  loginPrompt: { marginTop: '1.5rem', fontSize: '0.95rem', color: '#6b7280' },
  loginLink: { color: '#f6ad55', fontWeight: '700', textDecoration: 'none' }
};

export default Register;