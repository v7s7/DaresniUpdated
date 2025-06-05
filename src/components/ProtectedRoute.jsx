import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; 

const ProtectedRoute = ({ children, role, bypassAuth }) => {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in
  const [userRole, setUserRole] = useState(null); // To hold the role of the user
  const [loading, setLoading] = useState(true); // Added loading state for role fetching

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const fetchUserRole = async () => {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role); // Store the user role
          }
          setLoading(false); // Once role is fetched, set loading to false
        };
        fetchUserRole();
      } else {
        setUser(null);
        setLoading(false); // No user found, stop loading
      }
    });

    return () => unsubscribe();
  }, []);

  // Show loading state until user role is fetched
  if (loading) {
    return <p>Loading...</p>;
  }

  // Bypass the authentication for all routes if `bypassAuth` is true
  if (bypassAuth) {
    return children; // Allow access without any checks
  }

  // If you want to completely remove redirection logic, just return the children without checks.
  return children; // No redirection, just render the content
};

export default ProtectedRoute;
