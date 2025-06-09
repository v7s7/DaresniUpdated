import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; 

const ProtectedRoute = ({ children, role, bypassAuth }) => {
  const [user, setUser] = useState(undefined); // undefined means still loading, null means no user is logged in
  const [userRole, setUserRole] = useState(null); // Here we store the user's role (like admin, student, etc.)
  const [loading, setLoading] = useState(true); // This shows "loading..." until we get the user's role
  const [error, setError] = useState(null); // If there is an error when getting user data, we store it here

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // We fetch the user's role from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role); // Save the user's role here
            setUser(currentUser); // Set the current user
          } else {
            setUserRole(null); // If no role is found, we set it to null
          }
        } catch (error) {
          setError("Error fetching user data"); // Show error message if there is a problem
        } finally {
          setLoading(false); // Stop loading after we try to get the role
        }
      } else {
        setUser(null); // If no user is logged in, set user to null
        setUserRole(null); // No role since no user is logged in
        setLoading(false); // Stop loading once we know there's no user
      }
    });

    return () => unsubscribe(); // Clean up the listener when the component is no longer in use
  }, []);

  // Show loading message until we have the user's role
  if (loading) {
    return <p>Loading...</p>;
  }

  // If there is an error, show the error message
  if (error) {
    return <p>{error}</p>;
  }

  // If we want to skip authentication checks, just show the content
  if (bypassAuth) {
    return children; // Allow access without checking
  }

  // If the user's role is needed, check if they have the right one
  if (role && userRole !== role) {
    return <p>Access Denied: You do not have the right permissions.</p>; // Deny access if the user doesn't have the correct role
  }

  // If everything is okay, just show the page content
  return children;
};

export default ProtectedRoute;
