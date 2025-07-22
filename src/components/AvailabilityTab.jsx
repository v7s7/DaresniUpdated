import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

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
  const [user] = useAuthState(auth);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingSlots, setExistingSlots] = useState([]);
  const [message, setMessage] = useState("");

  const days = getMonthDays(currentYear, currentMonth);

  // Fetch existing slots for selected date
  useEffect(() => {
    if (!user || !selectedDate) return;
    const fetch = async () => {
      const q = query(
        collection(db, "availabilities"),
        where("tutorId", "==", user.uid),
        where("date", "==", selectedDate)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setExistingSlots(snapshot.docs[0].data().slots || []);
      } else {
        setExistingSlots([]);
      }
    };
    fetch();
  }, [user, selectedDate]);

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
      await setDoc(doc(db, "availabilities", `${user.uid}_${selectedDate}`), {
        tutorId: user.uid,
        date: selectedDate,
        slots: selectedSlots,
      });
      setMessage("Availability saved!");
      setSelectedSlots([]);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error saving availability.");
    }
  };

  const formatDate = (date) =>
    date.toISOString().split("T")[0]; // yyyy-mm-dd

  return (
    <div style={{ padding: "1.5rem", maxWidth: "600px", margin: "auto" }}>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem", color: "#1e3a8a" }}>
        🗓 Manage Your Availability
      </h3>

      {message && (
        <div
          style={{
            backgroundColor: "#fef3c7",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            marginBottom: "1rem",
            color: "#92400e",
            fontWeight: "500",
          }}
        >
          {message}
        </div>
      )}

      {/* Month Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <button
          onClick={() => setCurrentMonth((m) => (m === 0 ? 11 : m - 1))}
          style={{ padding: "0.3rem 0.6rem", cursor: "pointer" }}
        >
          ←
        </button>
        <h4>{new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })}</h4>
        <button
          onClick={() => setCurrentMonth((m) => (m === 11 ? 0 : m + 1))}
          style={{ padding: "0.3rem 0.6rem", cursor: "pointer" }}
        >
          →
        </button>
      </div>

      {/* Days Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {days.map((day, idx) => {
          const formatted = formatDate(day);
          const isToday = formatDate(today) === formatted;
          const isSelected = selectedDate === formatted;
          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(formatted)}
              style={{
                textAlign: "center",
                padding: "0.5rem",
                borderRadius: "6px",
                backgroundColor: isSelected
                  ? "#1e3a8a"
                  : isToday
                  ? "#e0e7ff"
                  : "#f9fafb",
                color: isSelected ? "#fff" : "#111",
                cursor: "pointer",
                border: "1px solid #ccc",
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
    <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>
      Select Time Slots:
    </h4>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
        gap: "0.7rem",
        padding: "0.5rem 0",
      }}
    >
      {TIME_SLOTS.map((time) => {
        const isSelected = selectedSlots.includes(time);
        return (
          <button
            key={time}
            onClick={() => toggleSlot(time)}
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "25px",
              border: isSelected ? "2px solid #1e3a8a" : "1px solid #cbd5e1",
              backgroundColor: isSelected ? "#1e3a8a" : "#f1f5f9",
              color: isSelected ? "#fff" : "#1e293b",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = "#f1f5f9";
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
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {existingSlots.map((s, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: "#e0f2fe",
                  padding: "0.3rem 0.8rem",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        style={{
          marginTop: "1.5rem",
          backgroundColor: "#1e3a8a",
          color: "#fff",
          padding: "0.6rem 1.2rem",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        Save Availability
      </button>
    </div>
  );
}
