import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function RequestsTab() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      setLoading(true);
      const q = query(
        collection(db, "bookings"),
        where("tutorId", "==", user.uid),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(data);
      setLoading(false);
    };

    fetchRequests();
  }, [user]);

  const handleDecision = async (id, decision) => {
    const ref = doc(db, "bookings", id);
    await updateDoc(ref, { status: decision });
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="card">
      <h3>📩 Pending Session Requests</h3>
      {requests.length === 0 ? (
        <p>No new requests at the moment.</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req.id} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #ccc" }}>
              <strong>{req.subject}</strong> with {req.studentName}
              <br />
              📅 {new Date(req.date.seconds * 1000).toLocaleString()}
              <br />
              <button
                onClick={() => handleDecision(req.id, "upcoming")}
                style={{ marginRight: "1rem", padding: "0.4rem 1rem", backgroundColor: "#22c55e", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" }}
              >
                Accept
              </button>
              <button
                onClick={() => handleDecision(req.id, "rejected")}
                style={{ padding: "0.4rem 1rem", backgroundColor: "#ef4444", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer" }}
              >
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
