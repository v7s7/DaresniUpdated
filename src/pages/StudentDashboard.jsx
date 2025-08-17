import { useState, useRef, useEffect } from 'react';
import { useTutors } from '../TutorContext';
import { auth, db } from '../firebase';
import { query, collection, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import TutorCard from '../components/TutorCard';
import HistoryTab from '../components/HistoryTab';
import '../pages/Home/HomePage.css';

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

  // Subscribe to student's bookings
  useEffect(() => {
    if (!auth.currentUser) return;

    const now = Timestamp.now();
    // We pull all statuses for the student and filter in UI; if you’d like you can
    // split into two subscriptions (future vs history). Keeping simple here.
    const qy = query(
      collection(db, 'bookings'),
      where('studentId', '==', auth.currentUser.uid),
      orderBy('startAt', 'asc')
    );

    const unsubscribe = onSnapshot(qy, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    });

    return () => unsubscribe();
  }, []);

  // Pagination logic for Tutors tab
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = tutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const totalPages = Math.ceil(tutors.length / tutorsPerPage);

  function formatWhen(b) {
    const ts = b.startAt?.toDate
      ? b.startAt.toDate()
      : (b.date && b.time ? new Date(`${b.date}T${b.time}:00`) : null);
    return ts ? ts.toLocaleString() : '—';
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming': {
        const now = Date.now();
        const upcoming = bookings.filter((b) => {
          const t = b.startAt?.toDate ? b.startAt.toDate().getTime() : null;
          const isFuture = t ? t >= now : true; // keep legacy items if no startAt
          return isFuture && (b.status === 'pending' || b.status === 'approved');
        });

        return (
          <div>
            <h2 className="section-title">Your Upcoming Sessions</h2>
            {upcoming.length === 0 ? (
              <p>No upcoming sessions yet.</p>
            ) : (
              upcoming.map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundColor: b.status === 'pending' ? '#fff7ed' : '#f9fafb',
                  }}
                >
                  <p><strong>Tutor:</strong> {b.tutorName || b.tutorId}</p>
                  <p><strong>Subject:</strong> {b.subject || 'N/A'}</p>
                  <p><strong>Date & Time:</strong> {formatWhen(b)}</p>
                  <p><strong>Status:</strong> {b.status}</p>
                </div>
              ))
            )}
          </div>
        );
      }

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
        return <HistoryTab mode="student" />;

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
