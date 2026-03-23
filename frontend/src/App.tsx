import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/Home';
import CoursePage from './pages/CoursePage'; 
import CourseDetailPage from './pages/CourseDetail';

function App() {
  return (
    <BrowserRouter>
      <Header /> 
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* TO JEST KLUCZOWE: */}
          <Route path="/katalog" element={<CoursePage />} /> 
          <Route path="/course/:id" element={<CourseDetailPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;