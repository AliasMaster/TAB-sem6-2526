import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/Home';
import CoursePage from './pages/CoursePage'; 
import CourseDetailPage from './pages/CourseDetail';
import LessonSection from './pages/LessonSection';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Community from './pages/Community';

// Nasza nowa logika użytkownika
export type Role = 'Admin' | 'Client' | 'Firm';

export interface User {
  id: string | number; // Backend C# generuje Guid (string), więc dla bezpieczeństwa dodajemy | string
  login: string;
  email: string;
  role: Role;
  profilePic?: string | null;
}

function App() {
  const [user, setUser] = useState<User | null>(null); 
  
  // NOWOŚĆ: Stan ładowania, aby aplikacja "poczekała" na sprawdzenie sesji z backendu
  const [isLoading, setIsLoading] = useState(true);

  // NOWOŚĆ: Mechanizm sprawdzania ciasteczka po załadowaniu strony
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // KRYTYCZNE: Mówi przeglądarce "Wyślij moje ciasteczko!"
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // Jeśli ciasteczko jest ważne, logujemy usera
        } else {
          setUser(null); // Jeśli ciasteczko wygasło, czyścimy sesję
        }
      } catch (error) {
        console.error("Błąd weryfikacji sesji:", error);
        setUser(null);
      } finally {
        // Niezależnie czy się udało, czy nie, kończymy ekran ładowania
        setIsLoading(false);
      }
    };

    checkSession();
  }, []); // Pusta tablica oznacza, że to wykona się tylko raz, przy odświeżeniu/włączeniu strony

  // Zabezpieczenie przed "miganiem" aplikacji podczas sprawdzania ciasteczka
  if (isLoading) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#0c111e' }}></div>;
  }

  return (
    <BrowserRouter>
      {/* Przekazujemy obiekt user i funkcję setUser */}
      <Header user={user} setUser={setUser} /> 
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/katalog" element={<CoursePage />} />
          <Route path="/forum" element={<Community user={user} />} />
          
          <Route path="/login" element={<Login setUser={setUser} />} /> 

          <Route path="/nauka" element={
            <ProtectedRoute user={user}>
              <LessonSection />
            </ProtectedRoute>
          } /> 
          <Route path="/course/:id" element={
            <ProtectedRoute user={user}>
              <CourseDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/profil" element={<Profile user={user} setUser={setUser} />} />
        </Routes>
          
      </main>
    </BrowserRouter>
  );
}

export default App;