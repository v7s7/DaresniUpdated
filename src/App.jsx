import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TutorProvider } from './TutorContext.jsx';
import AdminPage from './pages/Admin/AdminPage';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashBoard';
import LoginPage from './pages/Login/LoginPage';
import SignUpPage from './pages/SignUp/SignUpPage';
import HomePage from './pages/Home/HomePage';
import TutorProfile from './pages/TutorProfile/TutorProfile';
import TutorProfilePage from './pages/TutorProfile/TutorProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import StudentProfile from './pages/StudentProfile/StudentProfile';
import Navbar from './components/Navbar';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Your firebase auth setup


import './App.css';

function AppWrapper() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  const hideNavbarOnRoutes = ['/', '/signup'];
  const shouldShowNavbar = !hideNavbarOnRoutes.includes(location.pathname);

  // Check if the user is logged in and redirect them to the appropriate dashboard
  const redirectToDashboard = () => {
    if (user) {
      if (user.role === 'student') {
        return <Navigate to="/student" />;
      } else if (user.role === 'tutor') {
        return <Navigate to="/tutor" />;
      } else if (user.role === 'admin') {
        return <Navigate to="/admin" />;
      } else {
        return <Navigate to="/home" />;
      }
    }
    return null; // If the user is not logged in, continue to show the login page
  };

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={user ? redirectToDashboard() : <LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Tutor & Student Profiles */}
        <Route
          path="/tutor/:id"
          element={
            <ProtectedRoute role="student" user={user}>
              <TutorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/profile"
          element={
            <ProtectedRoute role="tutor" user={user}>
              <TutorProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/student/profile" element={<StudentProfile />} />

        {/* Admin & Dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin" user={user}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student" user={user}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute role="tutor" user={user}>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <TutorProvider>
      <BrowserRouter>
        <AppWrapper /> {/* This should be the only routing component */}
      </BrowserRouter>
    </TutorProvider>
  );
}

export default App;
