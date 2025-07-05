import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

export default function AvailabilityTab() {
  const [user] = useAuthState(auth);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [existingSlots, setExistingSlots] = useState([]);

  useEffect(() => {
    if (!user || !date) return;
    const fetch = async () => {
      const q = query(
        collection(db, "availabilities"),
        where("tutorId", "==", user.uid),
        where("date", "==", date)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setExistingSlots(doc.data().slots || []);
      } else {
        setExistingSlots([]);
      }
    };
    fetch();
  }, [user, date]);

  const handleAddSlot = () => {
    if (slot && !slots.includes(slot)) {
      setSlots((prev) => [...prev, slot]);
      setSlot("");
    }
  };

  const handleSave = async () => {
    if (!user || !date || slots.length === 0) return;
    await setDoc(doc(db, "availabilities", `${user.uid}_${date}`), {
      tutorId: user.uid,
      date,
      slots,
    });
    alert("Availability saved.");
    setSlots([]);
    setDate("");
  };

  return (
    <div className="card">
      <h3>🗓️ Manage Your Availability</h3>
      <label>
        Select Date:{" "}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <div style={{ marginTop: "1rem" }}>
        <input
          type="time"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        />
        <button onClick={handleAddSlot} style={{ marginLeft: "1rem" }}>
          ➕ Add Slot
        </button>
      </div>

      {slots.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4>New Slots:</h4>
          <ul>
            {slots.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {existingSlots.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Existing Slots:</h4>
          <ul>
            {existingSlots.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSave}
        style={{
          marginTop: "1rem",
          backgroundColor: "#1e3a8a",
          color: "#fff",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Save Availability
      </button>
    </div>
  );
}
