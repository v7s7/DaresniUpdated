import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorCard from '../../components/TutorCard';
import './HomePage.css';

const dummyTutors = [
  // ... your dummy data here (add more to test pagination)
];

export default function HomePage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 20; // Show 20 tutors per page

  const handleViewProfile = (tutor) => {
    navigate(`/tutor/${tutor.id}`, { state: { tutor } });
  };

  // Pagination logic
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = dummyTutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const totalPages = Math.ceil(dummyTutors.length / tutorsPerPage);

  return (
    <div className="home-container">
      <header className="header">
        <h1>DARESNI</h1>
        <div className="cart-icon">🛒</div>
      </header>

      <div className="search-bar">
        <input type="text" placeholder="Search here..." />
      </div>

      <h2 className="section-title">Tutors & Coaches List</h2>

      <div className="tutor-list">
        {currentTutors.map((tutor) => (
          <TutorCard
            key={tutor.id}
            tutor={tutor}
            onViewProfile={() => handleViewProfile(tutor)}
          />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
