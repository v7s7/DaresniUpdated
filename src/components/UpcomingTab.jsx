import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, Timestamp } from "firebase/firestore";

function formatWhen(session) {
  const ts = session.startAt?.toDate
    ? session.startAt.toDate()
    : (session.date && session.time ? new Date(`${session.date}T${session.time}:00`) : null);
  return ts ? ts.toLocaleString() : "—";
}

export default function UpcomingTab() {
  const [user] = useAuthState(auth);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const now = Timestamp.now();
    const qy = query(
      collection(db, "bookings"),
      where("tutorId", "==", user.uid),
      where("status", "==", "approved"),
      where("startAt", ">=", now),
      orderBy("startAt", "asc")
    );

    const unsubscribe = onSnapshot(qy, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSessions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    const bookingRef = doc(db, "bookings", id);
    await updateDoc(bookingRef, { status: newStatus });
  };

  if (loading) return <p>Loading upcoming sessions...</p>;
  if (sessions.length === 0) return <p>No upcoming sessions found.</p>;

  return (
    <div className="card">
      <h3>📅 Upcoming Sessions</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session.id} style={{ marginBottom: "1rem" }}>
            <strong>{session.subject || "No Subject"}</strong> with {session.studentName || session.studentId}
            <br />
            📅 {formatWhen(session)}
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
