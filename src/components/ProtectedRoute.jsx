import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; 
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role, bypassAuth }) => {
  const [user, setUser] = useState(undefined);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
            setUser(currentUser);
          } else {
            setUserRole(null);
            setUser(currentUser);
          }
        } catch (error) {
          setError("Error fetching user data");
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (bypassAuth) {
    return children;
  }

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    return <p>Access Denied: You do not have the right permissions.</p>;
  }

  return children;
};

export default ProtectedRoute;
