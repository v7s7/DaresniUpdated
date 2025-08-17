// src/pages/Home/HomePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TutorCard from '../../components/TutorCard';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import useAvailabilityWindowMap from '../../hooks/useAvailabilityWindowMap';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyWithAvailability, setOnlyWithAvailability] = useState(false);

  // Availability map for next 14 days
  const { map: availabilityMap, loading: availLoading } = useAvailabilityWindowMap(14);

  // Fetch tutors
  // Fetch tutors
useEffect(() => {
  const fetchTutors = async () => {
    try {
      // ⬇️ read from users where role == "tutor"
      const q = query(collection(db, 'users'), where('role', '==', 'tutor'));
      const querySnapshot = await getDocs(q);
      const tutorsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTutors(tutorsData);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };
  fetchTutors();
}, []);


  // Build list of subjects for the filter
  const allSubjects = useMemo(() => {
    const set = new Set();
    tutors.forEach(t => {
      if (Array.isArray(t.subjects)) {
        t.subjects.forEach(s => s?.name && set.add(s.name));
      }
      if (t.expertise) set.add(t.expertise);
    });
    return Array.from(set).sort();
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return tutors.filter(t => {
      // Search match
      const inText =
        !term ||
        (t.name && t.name.toLowerCase().includes(term)) ||
        (t.expertise && t.expertise.toLowerCase().includes(term)) ||
        (t.location && t.location.toLowerCase().includes(term)) ||
        (t.bio && t.bio.toLowerCase().includes(term));

      if (!inText) return false;

      // Subject filter
      if (subject) {
        const hasSubj =
          (Array.isArray(t.subjects) && t.subjects.some(s => (s?.name || '').toLowerCase() === subject.toLowerCase())) ||
          (t.expertise && t.expertise.toLowerCase() === subject.toLowerCase());
        if (!hasSubj) return false;
      }

      // Rating
      if (minRating) {
        const r = Number(minRating);
        if (!isNaN(r) && Number(t.rating || 0) < r) return false;
      }

      // Price range
      const price = Number(t.price ?? NaN);
      if (minPrice && !isNaN(Number(minPrice))) {
        if (isNaN(price) || price < Number(minPrice)) return false;
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        if (isNaN(price) || price > Number(maxPrice)) return false;
      }

      // Availability requirement
      if (onlyWithAvailability) {
        const avail = availabilityMap[t.id];
        if (!avail) return false;
      }

      return true;
    });
  }, [tutors, searchTerm, subject, minRating, minPrice, maxPrice, onlyWithAvailability, availabilityMap]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

      {/* Filters */}
      <div className="filters" style={{ display:'grid', gap:'0.5rem', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', alignItems:'end', marginBottom:'1rem' }}>
        <div className="search-bar" style={{ gridColumn:'span 2' }}>
          <input
            type="text"
            placeholder="Search name, expertise, location…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display:'block', fontSize:12, color:'#555' }}>Subject</label>
          <select value={subject} onChange={(e)=>setSubject(e.target.value)} style={{ width:'100%' }}>
            <option value="">Any</option>
            {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display:'block', fontSize:12, color:'#555' }}>Min Rating</label>
          <input type="number" step="0.1" min="0" max="5" value={minRating} onChange={(e)=>setMinRating(e.target.value)} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
          <div>
            <label style={{ display:'block', fontSize:12, color:'#555' }}>Min Price</label>
            <input type="number" value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, color:'#555' }}>Max Price</label>
            <input type="number" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} />
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <input
            id="onlyAvail"
            type="checkbox"
            checked={onlyWithAvailability}
            onChange={(e)=>setOnlyWithAvailability(e.target.checked)}
          />
          <label htmlFor="onlyAvail">Only with availability (14d)</label>
        </div>
      </div>

      <h2 className="section-title">
        Tutors & Coaches List {onlyWithAvailability && !availLoading ? `(${filteredTutors.length} with slots)` : ''}
      </h2>

      <div className="tutor-list">
        {filteredTutors.length ? (
          filteredTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              nextAvailable={availabilityMap[tutor.id] || null}
            />
          ))
        ) : (
          <p>{onlyWithAvailability ? 'No tutors with upcoming availability.' : 'No tutors found.'}</p>
        )}
      </div>
    </div>
  );
}
