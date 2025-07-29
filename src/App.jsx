import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminPage from './pages/Admin/AdminPage'; 
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashBoard';
import LoginPage from './pages/Login/LoginPage';
import SignUpPage from './pages/SignUp/SignUpPage';
import HomePage from './pages/Home/HomePage';
import TutorProfile from './pages/TutorProfile/TutorProfile';
import TutorProfilePage from './pages/TutorProfile/TutorProfilePage';
import ProtectedRoute from './components/ProtectedRoute'; 
import StudentProfile from "./pages/StudentProfile/StudentProfile";
import Navbar from './components/Navbar';

import './App.css';


function AppWrapper() {
  const location = useLocation();
  const hideNavbarOnRoutes = ['/', '/signup'];
  const shouldShowNavbar = !hideNavbarOnRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/tutor/:id"
          element={
            <ProtectedRoute role="student">
              <TutorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/profile"
          element={
            <ProtectedRoute role="tutor">
              <TutorProfilePage />
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
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute role="tutor">
              <TutorDashboard />
            </ProtectedRoute>
          }
        />
        Optional catch-all
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;