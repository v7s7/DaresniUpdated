// src/components/AvailabilityPicker.jsx
import { useEffect, useMemo, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { nextNDates, toISODate, combineLocal } from "../utils/time";

export default function AvailabilityPicker({ tutor }) {
  const tutorId = tutor?.id;
  const [days] = useState(() => nextNDates(14));
  const [selectedDate, setSelectedDate] = useState(toISODate(days[0]));
  const [slotsByDate, setSlotsByDate] = useState({}); // { 'YYYY-MM-DD': ['08:00', ...] }
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // derive subject options
  const subjectOptions = useMemo(() => {
    const list = [];
    if (Array.isArray(tutor?.subjects)) {
      tutor.subjects.forEach((s) => {
        if (s?.name) list.push(s.name);
      });
    }
    if (tutor?.expertise && !list.includes(tutor.expertise)) {
      list.push(tutor.expertise);
    }
    return list;
  }, [tutor]);

  // Load availabilities for the next 14 days
  useEffect(() => {
    if (!tutorId) return;
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const result = {};
        await Promise.all(
          days.map(async (d) => {
            const dateStr = toISODate(d);
            const refId = `${tutorId}_${dateStr}`;
            const snap = await getDoc(doc(db, "availabilities", refId));
            result[dateStr] = snap.exists() ? snap.data().slots || [] : [];
          })
        );
        if (isMounted) setSlotsByDate(result);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [tutorId, days]);

  const timesForSelected = slotsByDate[selectedDate] || [];

  const canBook =
    !!auth.currentUser &&
    !!tutorId &&
    !!selectedDate &&
    !!selectedTime &&
    (!!selectedSubject || subjectOptions.length === 0);

  const handleBook = async () => {
    if (!canBook) return;

    // Compose startAt as a Firestore Timestamp
    const startDate = combineLocal(selectedDate, selectedTime);
    const startAt = Timestamp.fromDate(startDate);

    // Conflict check: is there already a booking at that exact time?
    // We'll treat both 'pending' and 'approved' as blocking.
    const blocking = query(
      collection(db, "bookings"),
      where("tutorId", "==", tutorId),
      where("startAt", "==", startAt),
      where("status", "in", ["pending", "approved"])
    );
    const conflicts = await getDocs(blocking);
    if (!conflicts.empty) {
      alert("Sorry, this slot has just been taken. Pick another slot.");
      return;
    }

    const student = auth.currentUser;
    const subject =
      selectedSubject ||
      (subjectOptions.length ? subjectOptions[0] : "General");

    // Optional denormalized names
    const tutorName = tutor?.name || "";
    const studentName = student?.displayName || "";

    await addDoc(collection(db, "bookings"), {
      tutorId,
      tutorName,
      studentId: student.uid,
      studentName,
      subject,
      status: "pending",
      startAt,
      // legacy fields (optional, for backward compat)
      date: selectedDate,
      time: selectedTime,
      createdAt: serverTimestamp(),
    });

    alert("Request sent! The tutor will approve it.");
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3 style={{ margin: "0 0 0.5rem" }}>Available Slots (next 14 days)</h3>

      {loading ? (
        <p>Loading availability…</p>
      ) : (
        <>
          {/* Days */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {days.map((d) => {
              const dateStr = toISODate(d);
              const isSelected = dateStr === selectedDate;
              const hasSlots = (slotsByDate[dateStr] || []).length > 0;
              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setSelectedTime("");
                  }}
                  style={{
                    padding: "0.5rem",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: isSelected ? "#1e3a8a" : hasSlots ? "#eef2ff" : "#f9fafb",
                    color: isSelected ? "#fff" : "#111",
                    cursor: "pointer",
                    height: 56,
                  }}
                  title={dateStr}
                >
                  <div style={{ fontWeight: 700 }}>
                    {d.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div style={{ fontSize: 12 }}>
                    {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time slots for selected day */}
          <div>
            <h4 style={{ margin: "0 0 0.5rem" }}>
              {selectedDate} — Select a time
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                gap: "0.5rem",
              }}
            >
              {timesForSelected.length ? (
                timesForSelected.map((t) => {
                  const selected = t === selectedTime;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      style={{
                        padding: "0.6rem 0.8rem",
                        borderRadius: 24,
                        border: selected ? "2px solid #1e3a8a" : "1px solid #cbd5e1",
                        backgroundColor: selected ? "#1e3a8a" : "#f1f5f9",
                        color: selected ? "#fff" : "#1e293b",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {t}
                    </button>
                  );
                })
              ) : (
                <p>No availability on this day.</p>
              )}
            </div>
          </div>

          {/* Subject selector (if we have options) */}
          {subjectOptions.length > 0 && (
            <div style={{ marginTop: "1rem", maxWidth: 360 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ width: "100%", padding: "0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value="">Select…</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={handleBook}
              disabled={!canBook}
              style={{
                backgroundColor: canBook ? "#1e3a8a" : "#94a3b8",
                color: "#fff",
                padding: "0.7rem 1.2rem",
                border: "none",
                borderRadius: 8,
                cursor: canBook ? "pointer" : "not-allowed",
                fontWeight: 700,
              }}
            >
              Request Booking
            </button>
          </div>
        </>
      )}
    </div>
  );
}
