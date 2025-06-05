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
        <nav>
          <ThemeToggle />
        </nav>

        <Routes>
          {/* Default route ("/") goes to Login */}
          <Route path="/" element={<LoginPage />} />

          {/* SignUp route */}
          <Route path="/signup" element={<SignUpPage />} />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboards */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
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
