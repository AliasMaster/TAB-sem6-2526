import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/Home';
import CoursePage from './pages/CoursePage'; 
import CourseDetailPage from './pages/CourseDetail';
import LessonSection from './pages/LessonSection';
import Login from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import Register from './pages/Register';

// Nasza nowa logika użytkownika - po angielsku
export type Role = 'Admin' | 'Client' | 'Firm';

export interface User {
  id: number;
  login: string;
  email: string;
  role: Role;
  profilePic?: string | null; // Zdjęcie jest opcjonalne (Base64 string)
}

function App() {
  // Stan "user" zamiast "isLoggedIn"
  const [user, setUser] = useState<User | null>(null); 

  return (
    <BrowserRouter>
      {/* Przekazujemy obiekt user i funkcję setUser */}
      <Header user={user} setUser={setUser} /> 
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/katalog" element={<CoursePage />} /> 
          
          {/* Strona logowania dostaje funkcję setUser */}
          <Route path="/login" element={<Login setUser={setUser} />} /> 

          {/* Zostawiamy oryginalne ścieżki /nauka i /course/:id */}
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
          <Route path="/register" element={<Register setUser={setUser} />} />        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;