import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { addDoc, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const TutorProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const tutor = state?.tutor;

  const [availabilities, setAvailabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);

  // Fetch availabilities
  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!tutor) return;
      const q = query(
        collection(db, 'availabilities'),
        where('tutorId', '==', tutor.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailabilities(data);
    };
    fetchAvailabilities();
  }, [tutor]);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!tutor) return;
      try {
        const tutorDoc = await getDoc(doc(db, 'users', tutor.id));
        if (tutorDoc.exists()) {
          const data = tutorDoc.data();
          setSubjects(data.subjects || []);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    fetchSubjects();
  }, [tutor]);

  if (!tutor) return <p>Sorry, tutor not found.</p>;

  const handleBooking = async () => {
    if (!user) return alert('You must be logged in to book a tutor.');
    if (!selectedSubject) return alert('Select a subject.');
    if (!selectedDate || !selectedSlot) return alert('Select a date and slot.');

    try {
      // Add booking
      await addDoc(collection(db, 'bookings'), {
        studentId: user.uid,
        studentName: user.email,
        tutorId: tutor.id,
        tutorName: tutor.name,
        subject: selectedSubject,
        date: selectedDate,
        time: selectedSlot,
        status: 'pending',
      });

      // Remove booked slot from availability
      const availabilityQuery = query(
        collection(db, 'availabilities'),
        where('tutorId', '==', tutor.id),
        where('date', '==', selectedDate)
      );

      const snapshot = await getDocs(availabilityQuery);
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const currentSlots = snapshot.docs[0].data().slots || [];
        const updatedSlots = currentSlots.filter(s => s !== selectedSlot);
        await updateDoc(docRef, { slots: updatedSlots });
      }

      alert(`Booking request sent to ${tutor.name}!`);
      setSelectedSlot('');
      setSelectedSubject('');
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to book. Try again later.');
    }
  };

  const availableDates = availabilities.map(a => a.date);

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <img
          src={tutor.image}
          alt={tutor.name}
          style={{ width: '120px', height: '120px', borderRadius: '50%' }}
        />
        <div>
          <h2>
            {tutor.name} <span style={{ color: 'gold' }}>✔️</span>
          </h2>
          <p>
            <strong>Expertise:</strong> {tutor.expertise}
          </p>
          <p>
            <strong>Location:</strong> {tutor.location}
          </p>
          <p>
            <strong>Rating:</strong> ⭐ {tutor.rating}
          </p>
        </div>
      </div>

      {/* Subjects Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Subjects</h3>
        {subjects.length === 0 ? (
          <p>No subjects listed by this tutor.</p>
        ) : (
          <ul>
            {subjects.map((s, i) => (
              <li key={i}>
                {s.name} - BHD {s.pricePerHour} / hour
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Booking Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Book a Session</h3>

        {/* Select Subject */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map((s, i) => (
              <option key={i} value={s.name}>
                {s.name} - BHD {s.pricePerHour}/hour
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time Selection */}
        {availableDates.length === 0 ? (
          <p>No availability provided by this tutor.</p>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label>Date:</label>
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot('');
                }}
              >
                <option value="">Select Date</option>
                {availableDates.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {selectedDate && (
              <div style={{ marginBottom: '1rem' }}>
                <label>Time Slot:</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  <option value="">Select Slot</option>
                  {availabilities
                    .find(a => a.date === selectedDate)
                    ?.slots.map((s, i) => (
                      <option key={i} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={handleBooking}
        disabled={!selectedSlot || !selectedSubject}
        style={{
          marginTop: '2rem',
          backgroundColor:
            selectedSlot && selectedSubject ? '#1e3a8a' : '#999',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '10px',
          border: 'none',
          cursor:
            selectedSlot && selectedSubject ? 'pointer' : 'not-allowed',
        }}
      >
        Book Now
      </button>
    </div>
  );
};

export default TutorProfile;
