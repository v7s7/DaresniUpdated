import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorCard from '../../components/TutorCard';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 20;

  // Fetch tutors from Firestore
useEffect(() => {
  const fetchTutors = async () => {
  try {
    const q = query(collection(db, 'tutors'));  // Querying 'tutors' collection
    const querySnapshot = await getDocs(q);
    const tutorsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTutors(tutorsData);  // Storing fetched data in state
    console.log('Fetched Tutors:', tutorsData);  // Debugging log
  } catch (error) {
    console.error('Error fetching tutors:', error);
  }
};

  fetchTutors();
}, []);

  // Filter tutors based on search term
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = tutors.filter(tutor =>
      tutor.name?.toLowerCase().includes(term) ||
      tutor.expertise?.toLowerCase().includes(term) ||
      tutor.location?.toLowerCase().includes(term)
    );
    setFilteredTutors(filtered);
    setCurrentPage(1); // Reset to page 1 on new search
  }, [searchTerm, tutors]);

  // Pagination logic
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = filteredTutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);

  const handleViewProfile = (tutor) => {
    navigate(`/tutor/${tutor.id}`, { state: { tutor } });
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>DARESNI</h1>
        <div className="cart-icon">🛒</div>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search here..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h2 className="section-title">Tutors & Coaches List</h2>

      <div className="tutor-list">
        {currentTutors.length ? (
          currentTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onViewProfile={() => handleViewProfile(tutor)}
            />
          ))
        ) : (
          <p>No tutors found.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
