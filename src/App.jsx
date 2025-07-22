import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/Admin/AdminPage'; 
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashBoard';
import LoginPage from './pages/Login/LoginPage';
import SignUpPage from './pages/SignUp/SignUpPage';
import HomePage from './pages/Home/HomePage';
import TutorProfile from './pages/TutorProfile/TutorProfile';
import TutorProfilePage from './pages/TutorProfile/TutorProfilePage';
import ThemeToggle from './components/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute'; 
import StudentProfile from "./pages/StudentProfile/StudentProfile";

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div>
        {/* Global nav bar (only contains theme toggle for now) */}
        <nav>
          <ThemeToggle />
        </nav>

        <Routes>
          {/* Default route ("/") goes to Login */}
          <Route path="/" element={<LoginPage />} />

          {/* SignUp route */}
          <Route path="/signup" element={<SignUpPage />} />

          {/* Home route (public tutor list) */}
          <Route path="/home" element={<HomePage />} />

          {/* Protected Tutor Profile route (student only) */}
          <Route
            path="/tutor/:id"
            element={
              <ProtectedRoute role="student">
                <TutorProfile />
              </ProtectedRoute>
            }
          />

          {/* Tutor's own profile page */}
          <Route
            path="/tutor/profile"
            element={
              <ProtectedRoute role="tutor">
                <TutorProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Student dashboard */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/profile"
            element={<StudentProfile />}
          />

          {/* Tutor dashboard */}
          <Route
            path="/tutor"
            element={
              <ProtectedRoute role="tutor">
                <TutorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Optional catch-all */}
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
