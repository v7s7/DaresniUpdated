// TutorContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const TutorContext = createContext();
export const useTutors = () => useContext(TutorContext);

export const TutorProvider = ({ children }) => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'tutor'));
        const snapshot = await getDocs(q);
        const tutorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTutors(tutorsData);
      } catch (err) {
        console.error('Error fetching tutors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  return (
    <TutorContext.Provider value={{ tutors, loading }}>
      {children}
    </TutorContext.Provider>
  );
};
