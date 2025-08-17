// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, role: userRole, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  // Not "logged in" (in dev, this means no chosen role yet)
  if (!user) return <Navigate to="/home" replace />;

  // Role mismatch
  if (role && userRole !== role) {
    if (userRole === 'student') return <Navigate to="/student" replace />;
    if (userRole === 'tutor') return <Navigate to="/tutor" replace />;
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
