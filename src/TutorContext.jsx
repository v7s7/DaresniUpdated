import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';  // Import Firestore setup

const TutorContext = createContext();

export const useTutors = () => {
  return useContext(TutorContext);
};

export const TutorProvider = ({ children }) => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tutors'));  // Assuming 'tutors' is your collection name
        const tutorsData = querySnapshot.docs.map(doc => doc.data());
        setTutors(tutorsData);
      } catch (err) {
        console.error("Error fetching tutors: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);  // Empty array means it runs only once when the app mounts

  return (
    <TutorContext.Provider value={{ tutors, loading }}>
      {children}
    </TutorContext.Provider>
  );
};
