import { useState, useRef, useEffect } from 'react';
import { useTutors } from '../TutorContext';  // Import the useTutors hook from the context
import { auth, db } from '../firebase';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
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
  const { tutors, loading } = useTutors();  // Use tutors from context

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

  useEffect(() => {
  if (!auth.currentUser) {
    console.log("User is not logged in.");
    return;
  }

  console.log("Auth user UID:", auth.currentUser.uid); // Log UID
  
  const q = query(
    collection(db, 'bookings'), 
    where('studentId', '==', auth.currentUser.uid)
  );
  console.log("Firestore query:", q); // Log the query

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setBookings(data);
  });

  return () => unsubscribe(); // Cleanup on component unmount
}, []);


  // Pagination logic
  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = tutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const totalPages = Math.ceil(tutors.length / tutorsPerPage);

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <div>
            <h2 className="section-title">Your Upcoming Bookings</h2>
            {bookings.length === 0 ? (
              <p>No bookings yet.</p>
            ) : (
              bookings.map((b) => (
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
                  <p><strong>Tutor:</strong> {b.tutorName}</p>
                  <p><strong>Subject:</strong> {b.subject || 'N/A'}</p>
                  <p><strong>Date & Time:</strong> {b.date} at {b.time}</p>
                  <p><strong>Status:</strong> {b.status}</p>
                </div>
              ))
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
