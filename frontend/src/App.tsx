import { useState } from 'react'; // DODANE
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/Home';
import CoursePage from './pages/CoursePage'; 
import CourseDetailPage from './pages/CourseDetail';
import LessonSection from './pages/LessonSection';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';

function App() {
  // 1. Zastępujemy stałą 'isLoggedIn = false' prawdziwym stanem
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  return (
    <BrowserRouter>
      {/* 2. Przekazujemy też funkcję do wylogowywania do Headera */}
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> 
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/katalog" element={<CoursePage />} /> 
          
          {/* 3. Przekazujemy funkcję logowania do strony Login */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} /> 

          <Route path="/nauka" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <LessonSection />
            </ProtectedRoute>
          } /> 
          <Route path="/course/:id" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CourseDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;