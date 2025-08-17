import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

function formatWhen(b) {
  const ts = b.startAt?.toDate
    ? b.startAt.toDate()
    : (b.date && b.time ? new Date(`${b.date}T${b.time}:00`) : null);
  return ts ? ts.toLocaleString() : '—';
}

export default function RequestsTab() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState([]);

  // Listen for booking requests
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
    // Load the booking to get startAt/tutorId
    const bRef = doc(db, "bookings", bookingId);
    const bSnap = await getDoc(bRef);
    if (!bSnap.exists()) return;
    const b = bSnap.data();

    // Conflict: already approved booking at same time?
    if (b.startAt) {
      const q = query(
        collection(db, "bookings"),
        where("tutorId", "==", b.tutorId),
        where("startAt", "==", b.startAt),
        where("status", "==", "approved")
      );
      const conflicts = await getDocs(q);
      if (!conflicts.empty) {
        alert("This timeslot is already approved for another student.");
        return;
      }
    }

    await updateDoc(bRef, { status: "approved" });
  };

  const handleReject = async (bookingId) => {
    await deleteDoc(doc(db, "bookings", bookingId));
  };

  return (
    <div>
      <h3>Booking Requests</h3>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        requests.map((r) => (
          <div key={r.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <p><strong>Student:</strong> {r.studentName || r.studentId}</p>
            <p><strong>Subject:</strong> {r.subject || 'N/A'}</p>
            <p><strong>Date & Time:</strong> {formatWhen(r)}</p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => handleApprove(r.id)} style={{ backgroundColor: 'green', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
                Approve
              </button>
              <button onClick={() => handleReject(r.id)} style={{ backgroundColor: 'red', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
