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
import Profile from './pages/Profile';
import Community from './pages/Community';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import CompanyDashboard from './pages/dashboards/CompanyDashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header /> 
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CoursePage />} />
            <Route path="/community" element={<Community />} />
            
            <Route path="/login" element={<Login />} /> 
            <Route path="/register" element={<Register />} />
            
            <Route path="/lesson/:id" element={
              <ProtectedRoute allowedRoles={['User', 'Admin', 'Company']}>
                <LessonSection />
              </ProtectedRoute>
            } /> 
            
            <Route path="/course/:id" element={<CourseDetailPage />} />
            
            <Route path="/about" element={<About />} />
            
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['User', 'Admin', 'Company']}>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/company" element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;