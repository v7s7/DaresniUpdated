// context/AuthContext.jsx
import { createContext, useEffect, useState, useContext } from "react";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// =============================
// DEV SWITCH (toggle OFF later)
// =============================
const DEV_AUTH_BYPASS = true; // <-- set to false when you re-enable real login

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // Firebase user OR mock user
  const [role, setRole] = useState(null);   // "student" | "tutor" | "admin" | null
  const [loading, setLoading] = useState(true);

  // Helpers for dev bypass
  const setDevRole = (r) => {
    localStorage.setItem("devRole", r);
    localStorage.setItem("devUID", r === "student" ? "dev-student" : "dev-tutor");
    // mock user shape similar to Firebase user
    const mockUser = { uid: localStorage.getItem("devUID"), email: `${r}@dev.test` };
    setUser(mockUser);
    setRole(r);
  };

  const clearDevRole = () => {
    localStorage.removeItem("devRole");
    localStorage.removeItem("devUID");
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    // If dev bypass is ON and we have a stored role, skip Firebase entirely
    if (DEV_AUTH_BYPASS) {
      const storedRole = localStorage.getItem("devRole");
      const storedUID = localStorage.getItem("devUID");
      if (storedRole && storedUID) {
        setUser({ uid: storedUID, email: `${storedRole}@dev.test` });
        setRole(storedRole);
        setLoading(false);
        return;
      }
      // No stored role yet -> not "logged in"
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    // Real auth path (when DEV_AUTH_BYPASS = false)
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            try {
              const userDoc = await getDoc(doc(db, "users", currentUser.uid));
              setRole(userDoc.exists() ? userDoc.data().role : null);
            } catch (e) {
              console.error("Error fetching user role:", e);
              setRole(null);
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
    <AuthContext.Provider value={{ user, role, loading, setDevRole, clearDevRole, DEV_AUTH_BYPASS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
