import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorCard from '../../components/TutorCard';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useTutors } from '../../TutorContext';
import TutorFilters from '../../components/TutorFilters';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { tutors, loading } = useTutors();

  // Filter state
  const [filters, setFilters] = useState({
    query: '',
    subject: null,
    location: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    sortBy: null, // 'price_asc' | 'price_desc' | 'rating_desc' | 'rating_asc'
  });

  // Apply filters
  const filteredTutors = useMemo(() => {
    const q = (filters.query || '').toLowerCase().trim();

    const withinPrice = (t) => {
      // prefer subject-specific price if subject is chosen
      const subjectPrice = Array.isArray(t.subjects) && filters.subject
        ? (t.subjects.find(s => (s?.name || '').toLowerCase() === filters.subject?.toLowerCase())?.pricePerHour)
        : null;

      const price = subjectPrice != null ? subjectPrice : (t.price != null ? t.price : null);

      if (filters.minPrice != null && (price == null || price < filters.minPrice)) return false;
      if (filters.maxPrice != null && (price == null || price > filters.maxPrice)) return false;
      return true;
    };

    const matchesSubject = (t) => {
      if (!filters.subject) return true;
      if (Array.isArray(t.subjects)) {
        if (t.subjects.some(s => (s?.name || '').toLowerCase() === filters.subject.toLowerCase())) return true;
      }
      return ((t.expertise || '').toLowerCase() === filters.subject.toLowerCase());
    };

    const matchesLocation = (t) => {
      if (!filters.location) return true;
      return (t.location || '').toLowerCase() === filters.location.toLowerCase();
    };

    const matchesQuery = (t) => {
      if (!q) return true;
      const name = (t.name || '').toLowerCase();
      const expertise = (t.expertise || '').toLowerCase();
      const location = (t.location || '').toLowerCase();
      const subjectsText = Array.isArray(t.subjects) ? t.subjects.map(s => (s?.name || '').toLowerCase()).join(' ') : '';
      return [name, expertise, location, subjectsText].some(field => field.includes(q));
    };

    const matchesRating = (t) => {
      if (filters.minRating == null) return true;
      const r = Number(t.rating ?? 0);
      return r >= Number(filters.minRating);
    };

    let list = (tutors || []).filter(t =>
      withinPrice(t) && matchesSubject(t) && matchesLocation(t) && matchesQuery(t) && matchesRating(t)
    );

    // Sorting
    if (filters.sortBy) {
      const byPrice = (t) => {
        const subjectPrice = Array.isArray(t.subjects) && filters.subject
          ? (t.subjects.find(s => (s?.name || '').toLowerCase() === filters.subject?.toLowerCase())?.pricePerHour)
          : null;
        const price = subjectPrice != null ? subjectPrice : (t.price != null ? t.price : Number.POSITIVE_INFINITY);
        return price;
      };
      const byRating = (t) => Number(t.rating ?? -Infinity);

      if (filters.sortBy === 'price_asc') list.sort((a, b) => byPrice(a) - byPrice(b));
      if (filters.sortBy === 'price_desc') list.sort((a, b) => byPrice(b) - byPrice(a));
      if (filters.sortBy === 'rating_desc') list.sort((a, b) => byRating(b) - byRating(a));
      if (filters.sortBy === 'rating_asc') list.sort((a, b) => byRating(a) - byRating(b));
    }

    return list;
  }, [tutors, filters]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 20;

  useEffect(() => { setCurrentPage(1); }, [filters]);

  const indexOfLast = currentPage * tutorsPerPage;
  const indexOfFirst = indexOfLast - tutorsPerPage;
  const currentTutors = filteredTutors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);

  const handleViewProfile = (tutor) => {
    navigate(`/tutor/${tutor.id}`, { state: { tutor } });
  };

  const handleSignOut = async () => {
    try { await signOut(auth); } catch {}
    navigate('/home');
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

      <TutorFilters
        tutors={tutors}
        value={filters}
        onChange={setFilters}
      />

      <h2 className="section-title">Tutors & Coaches</h2>

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
          <p>No tutors match your filters.</p>
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
