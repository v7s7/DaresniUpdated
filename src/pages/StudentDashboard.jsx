import { useState, useRef, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
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

  // Fetch bookings
  const fetchBookings = async () => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "bookings"),
      where("studentId", "==", auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBookings(data);
  };

  useEffect(() => {
    if (activeTab === 'upcoming') {
      fetchBookings();
    }
  }, [activeTab]);

  // Cancel booking
  const handleCancelBooking = async (booking) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel the booking with ${booking.tutorName} on ${booking.date} at ${booking.time}?`
    );
    if (!confirmCancel) return;

    try {
      // Restore the cancelled slot in availabilities
      const availabilityQuery = query(
        collection(db, "availabilities"),
        where("tutorId", "==", booking.tutorId),
        where("date", "==", booking.date)
      );

      const snapshot = await getDocs(availabilityQuery);
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const currentSlots = snapshot.docs[0].data().slots || [];
        // Add the slot back if it's not already there
        if (!currentSlots.includes(booking.time)) {
          const updatedSlots = [...currentSlots, booking.time].sort();
          await updateDoc(docRef, { slots: updatedSlots });
        }
      } else {
        // Create a new availability document if none exists
        await updateDoc(doc(db, "availabilities", `${booking.tutorId}_${booking.date}`), {
          tutorId: booking.tutorId,
          date: booking.date,
          slots: [booking.time],
        });
      }

      // Delete the booking from Firestore
      await deleteDoc(doc(db, "bookings", booking.id));

      // Update local state
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

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
                  <p><strong>Subject:</strong> {b.subject || 'N/A'}</p>
                  <p>
                    <strong>Date & Time:</strong> {b.date} at {b.time}
                  </p>
                  <p><strong>Status:</strong> {b.status}</p>
                  <button
                    onClick={() => handleCancelBooking(b)}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#b91c1c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel Booking
                  </button>
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
