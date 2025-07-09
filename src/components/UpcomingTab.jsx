import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function UpcomingTab() {
  const [user] = useAuthState(auth);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, "bookings"),
      where("tutorId", "==", user.uid),
      where("status", "==", "upcoming")
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    const bookingRef = doc(db, "bookings", id);
    await updateDoc(bookingRef, { status: newStatus });
    fetchSessions(); // Refresh list
  };

  if (loading) return <p>Loading upcoming sessions...</p>;

  if (sessions.length === 0) return <p>No upcoming sessions found.</p>;

  return (
    <div className="card">
      <h3>📅 Upcoming Sessions</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session.id} style={{ marginBottom: "1rem" }}>
            <strong>{session.subject}</strong> with {session.studentName}
            <br />
            📅 {new Date(session.date.seconds * 1000).toLocaleString()}
            <br />
            <button
              onClick={() => updateStatus(session.id, "completed")}
              style={{ marginRight: "0.5rem", color: "green" }}
            >
              ✅ Mark as Completed
            </button>
            <button
              onClick={() => updateStatus(session.id, "cancelled")}
              style={{ color: "red" }}
            >
              ❌ Cancel
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
