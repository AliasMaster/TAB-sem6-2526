import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/Home';
import CourseDetailPage from './pages/CourseDetail';

function App() {
  return (
    
    <BrowserRouter>
      <Header /> 
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
        </Routes>
      </main>

      {}
    </BrowserRouter>
  );
}

export default App;