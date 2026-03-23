import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/Home';
import CourseDetailPage from './pages/CourseDetail';

function App() {
  return (
    // WSZYSTKO co używa linków musi być wewnątrz BrowserRouter......
    <BrowserRouter>
      <Header /> 
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
        </Routes>
      </main>

      {/* Footer też może być tutaj */}
    </BrowserRouter>
  );
}

export default App;