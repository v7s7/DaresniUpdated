import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            try {
              const userDoc = await getDoc(doc(db, "users", currentUser.uid));
              if (userDoc.exists()) {
                setRole(userDoc.data().role);
              } else {
                setRole(null);
              }
            } catch (e) {
              console.error("Error fetching user role:", e);
            }
          } else {
            setUser(null);
            setRole(null);
          }
          setLoading(false);
        });

        return unsubscribe;
      })
      .catch((error) => {
        console.error("Persistence setup failed:", error);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
