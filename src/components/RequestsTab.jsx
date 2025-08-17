// src/components/RequestsTab.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function RequestsTab() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "bookings"),
      where("tutorId", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleApprove = async (bookingId) => {
    await updateDoc(doc(db, "bookings", bookingId), { status: "approved" });
  };

  const handleReject = async (bookingId) => {
    await deleteDoc(doc(db, "bookings", bookingId));
    // (Optional) Instead of delete, you can mark { status: 'rejected' } for audit
  };

  return (
    <div>
      <h3>Booking Requests</h3>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        requests.map((r) => (
          <div key={r.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <p><strong>Student:</strong> {r.studentName}</p>
            <p><strong>Subject:</strong> {r.subject}</p>
            <p><strong>Date & Time:</strong> {r.date} {r.time ? `at ${r.time}` : ''}</p>
            <button onClick={() => handleApprove(r.id)} style={{ marginRight: '1rem', backgroundColor: 'green', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
              Approve
            </button>
            <button onClick={() => handleReject(r.id)} style={{ backgroundColor: 'red', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
}
