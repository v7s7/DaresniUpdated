import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const TutorProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const tutor = state?.tutor;

  if (!tutor) return <p>Sorry, tutor not found.</p>;

  const handleBooking = async () => {
    if (!user) return alert("You must be logged in to book a tutor.");

    try {
      await addDoc(collection(db, 'bookings'), {
        studentId: user.uid,
        studentName: user.email,
        tutorId: tutor.id,
        tutorName: tutor.name,
        time: new Date().toISOString(), // later can be selected
        status: "pending",
      });

      alert(`Booking request sent to ${tutor.name}!`);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book. Try again later.");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <img
          src={tutor.image}
          alt={tutor.name}
          style={{ width: '120px', height: '120px', borderRadius: '50%' }}
        />
        <div>
          <h2>{tutor.name} <span style={{ color: 'gold' }}>✔️</span></h2>
          <p><strong>Expertise:</strong> {tutor.expertise}</p>
          <p><strong>Location:</strong> {tutor.location}</p>
          <p><strong>Rating:</strong> ⭐ {tutor.rating}</p>
          <p><strong>Price:</strong> BHD {tutor.price}</p>
          <p><strong>Availability:</strong> ✅ Available</p>
        </div>
      </div>

      <button
        onClick={handleBooking}
        style={{
          marginTop: '2rem',
          backgroundColor: '#1e3a8a',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Book Now
      </button>
    </div>
  );
};

export default TutorProfile;
