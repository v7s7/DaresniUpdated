import { useState, useRef, useEffect, useMemo } from 'react';
import { useTutors } from '../TutorContext';
import { auth, db } from '../firebase';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import TutorCard from '../components/TutorCard';
import HistoryTab from '../components/HistoryTab';
import '../pages/Home/HomePage.css';
import { asDate } from '../utils/dates'; // <— new helper

export default function StudentDashboard() {
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'tutors', label: 'Tutors' },
    { id: 'history', label: 'History' },
  ];

  const [activeTab, setActiveTab] = useState('upcoming');
  const [fade, setFade] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 6;

  const buttonsRef = useRef({});
  const highlightRef = useRef();

  const [bookings, setBookings] = useState([]);
  const { tutors, loading } = useTutors();

  // Animate tab highlight
  useEffect(() => {
    const activeBtn = buttonsRef.current[activeTab];
    if (activeBtn && highlightRef.current) {
      const rect = activeBtn.getBoundingClientRect();
      const parentRect = activeBtn.parentElement.getBoundingClientRect();
      highlightRef.current.style.width = `${rect.width}px`;
      highlightRef.current.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    }
  }, [activeTab]);

  // Smooth fade transition
  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  // Real-time listener for this student's bookings
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'bookings'),
      where('studentId', '==', auth.currentUser.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    });
    return () => unsub();
  }, []);

  // Derive sections
  const { pendingBookings, approvedBookings } = useMemo(() => {
    const pending = [];
    const approved = [];
    for (const b of bookings) {
      if (b.status === 'pending') pending.push(b);
      else if (b.status === 'approved') approved.push(b);
    }
    // Sort by date if present
    const sorter = (a, b) => {
      const da = asDate(a.startAt) || asDate(a.date);
      const dbb = asDate(b.startAt) || asDate(b.date);
      return (da?.getTime?.() || 0) - (dbb?.getTime?.() || 0);
    };
    pending.sort(sorter);
    approved.sort(sorter);
    return { pendingBookings: pending, approvedBookings: approved };
  }, [bookings]);

  // Pagination for tutors tab
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = tutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const totalPages = Math.ceil(tutors.length / tutorsPerPage);

  const renderBookingRow = (b) => {
    const when = asDate(b.startAt) || asDate(b.date);
    return (
      <div
        key={b.id}
        style={{
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '0.75rem',
          backgroundColor: b.status === 'pending' ? '#fff7ed' : '#f9fafb',
        }}
      >
        <p><strong>Tutor:</strong> {b.tutorName || b.tutorId}</p>
        <p><strong>Subject:</strong> {b.subject || 'N/A'}</p>
        <p>
          <strong>Date & Time:</strong>{' '}
          {when ? when.toLocaleString() : (b.date && b.time ? `${b.date} ${b.time}` : 'Not set')}
        </p>
        <p><strong>Status:</strong> {b.status}</p>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <div>
            <h2 className="section-title">Your Bookings</h2>

            <h3 style={{ margin: '0.5rem 0' }}>Pending Approval</h3>
            {pendingBookings.length === 0 ? (
              <p>No pending requests.</p>
            ) : (
              pendingBookings.map(renderBookingRow)
            )}

            <h3 style={{ margin: '1rem 0 0.5rem' }}>Approved (Upcoming)</h3>
            {approvedBookings.length === 0 ? (
              <p>No approved sessions yet.</p>
            ) : (
              approvedBookings.map(renderBookingRow)
            )}
          </div>
        );

      case 'tutors':
        return (
          <div>
            <h2 className="section-title">Tutors & Coaches List</h2>
            <div className="tutor-list">
              {loading ? (
                <p>Loading tutors...</p>
              ) : currentTutors.length === 0 ? (
                <p>No tutors available right now.</p>
              ) : (
                currentTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
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

      case 'history':
        return <HistoryTab />;

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Tab Navigation */}
      <div className="tab-nav">
        <div ref={highlightRef} className="tab-highlight" />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (buttonsRef.current[tab.id] = el)}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'active' : ''}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div key={activeTab} className={`tab-content ${fade ? 'show' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
}
