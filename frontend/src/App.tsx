import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
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

import RestrictCompany from './components/RestrictCompany';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<RestrictCompany><HomePage /></RestrictCompany>} />
            <Route path="/catalog" element={<RestrictCompany><CoursePage /></RestrictCompany>} />
            <Route path="/community" element={<RestrictCompany><Community /></RestrictCompany>} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/lesson/:id"
              element={
                <ProtectedRoute allowedRoles={['User', 'Admin']}>
                  <LessonSection />
                </ProtectedRoute>
              }
            />

            <Route path="/course/:id" element={<RestrictCompany><CourseDetailPage /></RestrictCompany>} />

            <Route path="/about" element={<RestrictCompany><About /></RestrictCompany>} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['User', 'Admin', 'Company']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/company"
              element={
                <ProtectedRoute allowedRoles={['Company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
