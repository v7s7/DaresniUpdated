import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

function formatWhen(session) {
  const ts = session.startAt?.toDate
    ? session.startAt.toDate()
    : (session.date && session.time ? new Date(`${session.date}T${session.time}:00`) : null);
  return ts ? ts.toLocaleString() : "—";
}

export default function HistoryTab({ mode = "tutor" }) {
  const [user] = useAuthState(auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
      const field = mode === "student" ? "studentId" : "tutorId";
      const qy = query(
        collection(db, "bookings"),
        where(field, "==", user.uid),
        where("status", "in", ["completed", "cancelled"])
      );
      const snapshot = await getDocs(qy);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHistory(data);
      setLoading(false);
    };

    fetchHistory();
  }, [user, mode]);

  if (loading) return <p>Loading session history...</p>;
  if (history.length === 0) return <p>No session history found.</p>;

  return (
    <div className="card">
      <h3>📜 Session History</h3>
      <ul>
        {history.map((session) => (
          <li key={session.id} style={{ marginBottom: "1rem" }}>
            <strong>{session.subject || "N/A"}</strong>{" "}
            {mode === "student" ? (
              <>with {session.tutorName || session.tutorId}</>
            ) : (
              <>with {session.studentName || session.studentId}</>
            )}
            <br />
            📅 {formatWhen(session)} <br />
            ✅ Status: {session.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
