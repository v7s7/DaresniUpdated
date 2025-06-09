import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/Admin/AdminPage'; 
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashBoard';
import LoginPage from './pages/Login/LoginPage';
import SignUpPage from './pages/SignUp/SignUpPage';
import ThemeToggle from './components/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute'; 
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

          {/* Protected Routes */}

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Student dashboard, protected */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Tutor dashboard, protected */}
          <Route
            path="/tutor"
            element={
              <ProtectedRoute>
                <TutorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Optional catch-all route for undefined URLs */}
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
