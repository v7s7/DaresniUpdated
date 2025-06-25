import { useState, useRef, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import TutorCard from '../components/TutorCard';
import '../pages/Home/HomePage.css';

export default function StudentDashboard() {
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'tutors', label: 'Tutors' },
    { id: 'history', label: 'History' },
  ];

  const [activeTab, setActiveTab] = useState('tutors');
  const [fade, setFade] = useState(true);
  const buttonsRef = useRef({});
  const highlightRef = useRef();

  const [bookings, setBookings] = useState([]);

  // UI animation
  useEffect(() => {
    const activeBtn = buttonsRef.current[activeTab];
    if (activeBtn && highlightRef.current) {
      const rect = activeBtn.getBoundingClientRect();
      const parentRect = activeBtn.parentElement.getBoundingClientRect();
      highlightRef.current.style.width = `${rect.width}px`;
      highlightRef.current.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    }
  }, [activeTab]);

  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  // Load bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!auth.currentUser) return;
      const q = query(collection(db, "bookings"), where("studentId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    };

    if (activeTab === 'upcoming') {
      fetchBookings();
    }
  }, [activeTab]);

  const dummyTutors = [
    {
      id: 1,
      name: 'Adam Johnson',
      expertise: 'Web Development',
      location: 'Kingdom of Bahrain',
      price: 9,
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 2,
      name: 'Abdul Malik',
      expertise: 'Web Development',
      location: 'Kingdom of Bahrain',
      price: 9,
      rating: 4.5,
      image: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
    {
      id: 3,
      name: 'Zachary Lee',
      expertise: 'Web Development',
      location: 'Kingdom of Bahrain',
      price: 9,
      rating: 4.7,
      image: 'https://randomuser.me/api/portraits/men/34.jpg',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <>
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
                  }}
                >
                  <p><strong>Tutor:</strong> {b.tutorName}</p>
                  <p><strong>Time:</strong> {new Date(b.time).toLocaleString()}</p>
                  <p><strong>Status:</strong> {b.status}</p>
                </div>
              ))
            )}
          </>
        );

      case 'tutors':
        return (
          <>
            <h2 className="section-title">Tutors & Coaches List</h2>
            <div className="tutor-list">
              {dummyTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          </>
        );

      case 'history':
        return <p>No past sessions.</p>;

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          background: 'var(--bg-tabs)',
          padding: '0.5rem',
          borderRadius: '999px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          ref={highlightRef}
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: 0,
            height: '2.5rem',
            backgroundColor: 'var(--bg-active-tab)',
            borderRadius: '999px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'width 0.4s, transform 0.4s',
          }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (buttonsRef.current[tab.id] = el)}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative',
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              border: 'none',
              background: 'transparent',
              color:
                activeTab === tab.id
                  ? 'var(--color-active-tab-text)'
                  : 'var(--color-tab-text)',
              fontWeight: '600',
              cursor: 'pointer',
              zIndex: 1,
            }}
          >
            {tab.label}
            <span
              className="hover-bg"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '999px',
                backgroundColor: 'var(--bg-active-tab)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          </button>
        ))}
      </div>

      <div
        key={activeTab}
        style={{
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
