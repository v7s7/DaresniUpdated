// HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorCard from '../../components/TutorCard';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useTutors } from '../../TutorContext'; // <-- use context
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { tutors, loading } = useTutors(); // <-- from context
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 20;

  // Filter when tutors or searchTerm change
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = (tutors || []).filter(t =>
      (t.name || '').toLowerCase().includes(term) ||
      (t.expertise || '').toLowerCase().includes(term) ||
      (t.location || '').toLowerCase().includes(term)
    );
    setFilteredTutors(filtered);
    setCurrentPage(1);
  }, [searchTerm, tutors]);

  // Pagination
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = filteredTutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);

  const handleViewProfile = (tutor) => {
    navigate(`/tutor/${tutor.id}`, { state: { tutor } });
  };

  const handleSignOut = async () => {
    // In dev bypass, your Navbar already clears; if you keep this:
    try {
      await signOut(auth);
    } catch {}
    navigate('/home'); // safer during dev
  };

  return (
    <div className="home-container">
      <header className="header">
        <h1>DARESNI</h1>
        <div className="cart-icon">🛒</div>
      </header>

      <div className="sign-out-btn">
        <button onClick={handleSignOut}>Sign Out</button>
      </div>

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
        {loading ? (
          <p>Loading tutors...</p>
        ) : currentTutors.length ? (
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
