// src/components/HistoryTab.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { asDate } from "../utils/dates";

export default function HistoryTab() {
  const [user] = useAuthState(auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      const q = query(
        collection(db, "bookings"),
        where("tutorId", "==", user.uid),
        where("status", "in", ["completed", "cancelled"])
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(data);
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  if (loading) return <p>Loading session history...</p>;
  if (history.length === 0) return <p>No session history found.</p>;

  return (
    <div className="card">
      <h3>📜 Session History</h3>
      <ul>
        {history.map((session) => {
          const when =
            asDate(session.startAt) ||
            asDate(session.date);

          return (
            <li key={session.id} style={{ marginBottom: "1rem" }}>
              <strong>{session.subject || "No Subject"}</strong> with {session.studentName}
              <br />
              📅 {when ? when.toLocaleString() : (session.date && session.time ? `${session.date} ${session.time}` : "No Date")}
              <br />
              ✅ Status: {session.status}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
