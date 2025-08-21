import React, { useEffect, useState, useMemo } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00",
];

function getMonthDays(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function AvailabilityTab() {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingSlots, setExistingSlots] = useState([]);
  const [message, setMessage] = useState("");

  const days = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    if (!user || !selectedDate) return;
    const fetch = async () => {
      const ref = doc(db, "availabilities", `${user.uid}_${selectedDate}`);
      const snap = await getDoc(ref);
      if (snap.exists()) setExistingSlots(snap.data().slots || []);
      else setExistingSlots([]);
    };
    fetch();
  }, [user, selectedDate, db]);

  const toggleSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = async () => {
    if (!user || !selectedDate || selectedSlots.length === 0) {
      setMessage("Please select a date and at least one time slot.");
      return;
    }
    try {
      const ref = doc(db, "availabilities", `${user.uid}_${selectedDate}`);
      await setDoc(ref, {
        tutorId: user.uid,
        date: selectedDate,
        slots: selectedSlots,
        updatedAt: serverTimestamp(),
      });
      setExistingSlots(selectedSlots);
      setSelectedSlots([]);
      setMessage("Availability saved!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error saving availability.");
    }
  };

  const formatDate = (date) => date.toLocaleDateString("en-CA");

  return (
    <div style={{ padding: "1.5rem", maxWidth: "650px", margin: "auto", overflow: "visible", }}>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem", color: "#b91c1c" }}>
        🗓 Manage Your Availability
      </h3>

      {message && (
        <div style={{ backgroundColor: "#fee2e2", padding: "0.5rem 1rem", borderRadius: 8, marginBottom: "1rem", color: "#b91c1c", fontWeight: 500 }}>
          {message}
        </div>
      )}

      {/* Month Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <button onClick={() => setCurrentMonth((m) => (m === 0 ? 11 : m - 1))} style={{...styles.navBtn, color: '#b91c1c', borderColor:'#b91c1c'}}>←</button>
        <h4>{new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })}</h4>
        <button onClick={() => setCurrentMonth((m) => (m === 11 ? 0 : m + 1))} style={{...styles.navBtn, color: '#b91c1c', borderColor:'#b91c1c'}}>→</button>
      </div>

      {/* Weekday Headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", textAlign: "center", fontWeight: 600, marginBottom: "0.3rem" }}>
        {weekDays.map((wd) => <div key={wd}>{wd}</div>)}
      </div>

      {/* Days Grid */}
      <div style={styles.daysGrid}>
        {/* Empty slots for alignment */}
          {Array(days[0].getDay()).fill("").map((_, i) => (
            <div key={`empty-${i}`}></div>
          ))}

        {days.map((day, idx) => {
          const formatted = formatDate(day);
          const isToday = formatDate(today) === formatted;
          const isSelected = selectedDate === formatted;
          const isPast = day < today.setHours(0, 0, 0, 0);
          return (
            <div
              key={idx}
              onClick={() => !isPast && setSelectedDate(formatted)}
              style={{
                textAlign: "center",
                padding: "0.8rem",
                borderRadius: 8,
                backgroundColor: isSelected ? "#b91c1c" : isToday ? "#fee2e2" : "#f9fafb",
                color: isSelected ? "#fff" : isPast ? "#9ca3af" : "#111",
                cursor: isPast ? "not-allowed" : "pointer",
                border: "1px solid #ccc",
                fontWeight: isToday ? 600 : 400,
              }}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div style={{ marginTop: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Select Time Slots:</h4>
          <div style={styles.slotsGrid}>
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedSlots.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => toggleSlot(time)}
                  style={{
                    ...styles.slotBtn,
                    border: isSelected ? "2px solid #b91c1c" : "1px solid #ccc",
                    backgroundColor: isSelected ? "#b91c1c" : "#f1f5f9",
                    color: isSelected ? "#fff" : "#111",
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing Slots */}
      {existingSlots.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h4>Existing Slots:</h4>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {existingSlots.map((s, i) => (
              <span key={i} style={styles.existingSlot}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleSave} style={{...styles.saveBtn, backgroundColor:'#b91c1c', borderColor:'#b91c1c'}}>Save Availability</button>
    </div>
  );
}

const styles = {
  navBtn: { padding: "0.3rem 0.6rem", cursor: "pointer", borderRadius: 6, border: "1px solid", background: "#fff" },
  
  daysGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)", // 7 days per row
  gridAutoRows: "70px",                   // row height for uniform calendar cells
  gap: "0.5rem",
  marginBottom: "1rem",
    },

  slotsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "0.7rem", padding: "0.5rem 0" },
  slotBtn: { padding: "0.6rem 0.8rem", borderRadius: 25, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" },
  existingSlot: { backgroundColor: "#fee2e2", padding: "0.3rem 0.8rem", borderRadius: 20, fontSize: "0.9rem" },
  saveBtn: { marginTop: "1.5rem", color: "#fff", padding: "0.6rem 1.2rem", border: "1px solid", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: "1rem" },
};