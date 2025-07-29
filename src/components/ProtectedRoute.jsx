import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role, bypassAuth }) => {
  const { user, role: userRole, loading } = useAuth();

  console.log("ProtectedRoute Debug:", {
    user,
    userRole,
    loading,
    requiredRole: role,
  });

  if (loading) {
    return <p>Loading authentication...</p>; // Wait for Firebase auth check
  }

  if (bypassAuth) {
    return children;
  }

  if (!user) {
    console.warn("No authenticated user, redirecting to login...");
    return <Navigate to="/" replace />;
  }

  // TEMPORARY BYPASS FOR ROLE CHECK
  if (role && userRole !== role) {
    console.warn(`Role mismatch: userRole=${userRole}, expectedRole=${role}`);
    // return <p>Access Denied: You do not have the right permissions.</p>;
    return children; // TEMP bypass for testing
  }

  return children;
};

export default ProtectedRoute;
