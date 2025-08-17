// App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TutorProvider } from './TutorContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';

import AdminPage from './pages/Admin/AdminPage';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashBoard';
import HomeTest from './pages/Home/HomeTest'; // <-- new dev home
import TutorProfile from './pages/TutorProfile/TutorProfile';
import TutorProfilePage from './pages/TutorProfile/TutorProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import StudentProfile from './pages/StudentProfile/StudentProfile';
import Navbar from './components/Navbar';

import './App.css';

function AppRoutes() {
  const location = useLocation();
  const { user, role, loading } = useAuth();

  const hideNavbarOnRoutes = []; // show navbar everywhere during dev
  const shouldShowNavbar = !hideNavbarOnRoutes.includes(location.pathname);

  if (loading) return <div>Loading…</div>;

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        {/* Dev home: pick Student or Tutor */}
        <Route path="/home" element={<HomeTest />} />

        {/* Default route: if we already have a role, jump to its dashboard; else go to /home */}
        <Route
          path="/"
          element={user ? <Navigate to={`/${role || 'home'}`} /> : <Navigate to="/home" />}
        />

        {/* Public tutor profile (keep protected if you want) */}
        <Route path="/tutor/:id" element={<TutorProfile />} />

        {/* Profiles & dashboards */}
        <Route
          path="/tutor/profile"
          element={
            <ProtectedRoute role="tutor">
              <TutorProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute role="tutor">
              <TutorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TutorProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TutorProvider>
    </AuthProvider>
  );
}
