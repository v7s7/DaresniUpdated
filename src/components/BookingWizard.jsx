// src/components/BookingWizard.jsx
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

/* ---------- small time helpers ---------- */
function toISODate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function combineLocal(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}
/* ---------------------------------------- */

export default function BookingWizard({ tutor }) {
  const tutorId = tutor?.id;

  // Step state
  const [step, setStep] = useState(1); // 1 subject -> 2 date -> 3 time
  const [selectedSubject, setSelectedSubject] = useState("");
  const [duration, setDuration] = useState(60); // minutes
  const [pricePreview, setPricePreview] = useState(null);

  // Calendar window: 21 days from today
  const start = new Date();
  const days = Array.from({ length: 21 }, (_, i) => addDays(start, i));
  const [selectedDate, setSelectedDate] = useState(toISODate(days[0]));
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  // subjects from tutor
  const subjectOptions = useMemo(() => {
    const list = [];
    if (Array.isArray(tutor?.subjects)) {
      tutor.subjects.forEach((s) => s?.name && list.push(s.name));
    }
    if (tutor?.expertise && !list.includes(tutor.expertise)) {
      list.push(tutor.expertise);
    }
    return list;
  }, [tutor]);

  // derive price preview (subject-specific if available)
  useEffect(() => {
    const bySubject =
      Array.isArray(tutor?.subjects) && selectedSubject
        ? tutor.subjects.find(
            (s) => (s?.name || "").toLowerCase() === selectedSubject.toLowerCase()
          )
        : null;

    const pricePerHour =
      bySubject?.pricePerHour != null
        ? Number(bySubject.pricePerHour)
        : tutor?.price != null
        ? Number(tutor.price)
        : null;

    if (pricePerHour != null) {
      const total = Math.round(pricePerHour * (duration / 60) * 100) / 100;
      setPricePreview({ pricePerHour, total });
    } else {
      setPricePreview(null);
    }
  }, [tutor, selectedSubject, duration]);

  // Load availabilities for these 21 days
  useEffect(() => {
    if (!tutorId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const result = {};
        await Promise.all(
          days.map(async (d) => {
            const dateStr = toISODate(d);
            const id = `${tutorId}_${dateStr}`;
            const snap = await getDoc(doc(db, "availabilities", id));
            result[dateStr] = snap.exists() ? snap.data().slots || [] : [];
          })
        );
        if (mounted) setSlotsByDate(result);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [tutorId]); // days are deterministic from "today"

  const timesForSelected = slotsByDate[selectedDate] || [];

  const canProceedSubject = subjectOptions.length === 0 || !!selectedSubject;
  const canConfirm =
    !!auth.currentUser &&
    !!tutorId &&
    (!!selectedSubject || subjectOptions.length === 0) &&
    !!selectedDate &&
    !!selectedTime;

  async function handleConfirm() {
    if (!canConfirm) return;

    try {
      const startDate = combineLocal(selectedDate, selectedTime);
      const startAt = Timestamp.fromDate(startDate);

      // Block if taken (pending or approved)
      const blocking = query(
        collection(db, "bookings"),
        where("tutorId", "==", tutorId),
        where("startAt", "==", startAt),
        where("status", "in", ["pending", "approved"])
      );
      const conflicts = await getDocs(blocking);
      if (!conflicts.empty) {
        alert("That slot was just taken. Please pick a different time.");
        return;
      }

      const student = auth.currentUser;
      const subject =
        selectedSubject ||
        (subjectOptions.length ? subjectOptions[0] : "General");

      // Create booking (normalized startAt + legacy date/time for back-compat)
      await addDoc(collection(db, "bookings"), {
        tutorId,
        tutorName: tutor?.name || "",
        studentId: student.uid,
        studentName: student.displayName || student.email || "",
        subject,
        status: "pending",
        startAt,
        durationMin: duration,
        date: selectedDate, // legacy/back-compat
        time: selectedTime, // legacy/back-compat
        createdAt: serverTimestamp(),
      });

      alert("Request sent! The tutor will approve it.");

      // Reset local UI selections (keep selectedDate so they can book another time)
      setStep(1);
      setSelectedSubject("");
      setSelectedTime("");
    } catch (e) {
      console.error(e);
      alert("Something went wrong while booking. Please try again.");
    }
  }

  function isPastDay(d) {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    return d < midnight;
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <h3 style={{ margin: "0 0 0.75rem" }}>Book a session</h3>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 13 }}>
        <StepDot active={step >= 1} label="Subject" />
        <StepDot active={step >= 2} label="Date" />
        <StepDot active={step >= 3} label="Time" />
      </div>

      {/* Step 1: Subject */}
      {step === 1 && (
        <div>
          {subjectOptions.length === 0 ? (
            <p>No specific subjects listed. You can still proceed.</p>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {subjectOptions.map((s) => {
                const selected = s === selectedSubject;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(selected ? "" : s)}
                    style={{
                      padding: "0.5rem 0.8rem",
                      borderRadius: 999,
                      border: selected ? "2px solid #1e3a8a" : "1px solid #cbd5e1",
                      background: selected ? "#1e3a8a" : "#f1f5f9",
                      color: selected ? "#fff" : "#1e293b",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          )}

          {/* Duration + price preview */}
          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <div>
              <label style={{ fontWeight: 600, marginRight: 6 }}>Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: "1px solid #ddd" }}
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </div>
            {pricePreview && (
              <div style={{ color: "#111" }}>
                ~BHD {pricePreview.total}{" "}
                <span style={{ color: "#6b7280" }}>
                  (BHD {pricePreview.pricePerHour}/hr)
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedSubject}
              style={{
                backgroundColor: canProceedSubject ? "#1e3a8a" : "#94a3b8",
                color: "#fff",
                padding: "0.6rem 1rem",
                border: "none",
                borderRadius: 8,
                cursor: canProceedSubject ? "pointer" : "not-allowed",
                fontWeight: 700,
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Date */}
      {step === 2 && (
        <div>
          {loading ? (
            <p>Loading availability…</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 8,
              }}
            >
              {days.map((d) => {
                const dateStr = toISODate(d);
                const isSelected = dateStr === selectedDate;
                const hasSlots = (slotsByDate[dateStr] || []).length > 0;
                const disabled = isPastDay(d) || !hasSlots;
                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (disabled) return;
                      setSelectedDate(dateStr);
                      setSelectedTime("");
                      setStep(3);
                    }}
                    style={{
                      padding: "0.6rem",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      background: isSelected ? "#1e3a8a" : disabled ? "#f3f4f6" : "#eef2ff",
                      color: isSelected ? "#fff" : disabled ? "#9ca3af" : "#111",
                      cursor: disabled ? "not-allowed" : "pointer",
                      textAlign: "left",
                      height: 68,
                    }}
                    title={dateStr}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                    {hasSlots && !disabled && (
                      <div style={{ marginTop: 4, fontSize: 11, color: "#6b7280" }}>
                        {slotsByDate[dateStr].length} slots
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              onClick={() => setStep(1)}
              style={{
                background: "#f3f4f6",
                color: "#111",
                padding: "0.5rem 0.9rem",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Time */}
      {step === 3 && (
        <div>
          <div style={{ marginBottom: 8, color: "#111" }}>
            <strong>{selectedDate}</strong> — pick a time
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
              gap: 8,
            }}
          >
            {timesForSelected.length ? (
              timesForSelected.map((t) => {
                const selected = t === selectedTime;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(selected ? "" : t)}
                    style={{
                      padding: "0.6rem 0.8rem",
                      borderRadius: 999,
                      border: selected ? "2px solid #1e3a8a" : "1px solid #cbd5e1",
                      background: selected ? "#1e3a8a" : "#f1f5f9",
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
              <p>No availability for this day.</p>
            )}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setStep(2)}
              style={{
                background: "#f3f4f6",
                color: "#111",
                padding: "0.5rem 0.9rem",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Back
            </button>

            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                backgroundColor: canConfirm ? "#1e3a8a" : "#94a3b8",
                color: "#fff",
                padding: "0.6rem 1rem",
                border: "none",
                borderRadius: 8,
                cursor: canConfirm ? "pointer" : "not-allowed",
                fontWeight: 700,
              }}
            >
              Confirm Request
            </button>

            {pricePreview && (
              <div style={{ marginLeft: "auto", color: "#111" }}>
                Est. total: <strong>BHD {pricePreview.total}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepDot({ active, label }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: active ? "#1e3a8a" : "#e5e7eb",
        }}
      />
      <div style={{ color: active ? "#111" : "#9ca3af" }}>{label}</div>
    </div>
  );
}
