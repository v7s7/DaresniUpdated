import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, role: userRole, loading } = useAuth();

  // 🔧 DEV BYPASS: allow routes without login while testing
  const bypass = typeof window !== 'undefined' && localStorage.getItem('DEV_BYPASS') === 'true';
  if (bypass) return children;

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/" replace />;

  if (role && userRole !== role) {
    if (userRole === 'student') return <Navigate to="/student" replace />;
    if (userRole === 'tutor') return <Navigate to="/tutor" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
