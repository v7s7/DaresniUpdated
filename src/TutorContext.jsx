// src/TutorContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';

const TutorContext = createContext({ tutors: [], loading: true });
export const useTutors = () => useContext(TutorContext);

export const TutorProvider = ({ children }) => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'tutor'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTutors(arr);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening tutors:', err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return (
    <TutorContext.Provider value={{ tutors, loading }}>
      {children}
    </TutorContext.Provider>
  );
};
