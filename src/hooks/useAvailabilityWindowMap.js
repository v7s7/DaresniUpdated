// src/hooks/useAvailabilityWindowMap.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function toISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function useAvailabilityWindowMap(days = 14) {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);

        const startISO = toISO(start);
        const endISO = toISO(end);

        const qy = query(
          collection(db, "availabilities"),
          where("date", ">=", startISO),
          where("date", "<=", endISO)
        );
        const snap = await getDocs(qy);

        // Build earliest slot per tutor
        const byTutor = {};
        snap.forEach((doc) => {
          const data = doc.data();
          const { tutorId, date, slots = [] } = data || {};
          if (!tutorId || !date || !Array.isArray(slots) || slots.length === 0) return;

          // earliest time that day
          const sorted = [...slots].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
          const time = sorted[0];

          const [y, m, d] = date.split("-").map(Number);
          const [hh, mm] = time.split(":").map(Number);
          const startAtMs = new Date(y, m - 1, d, hh, mm, 0, 0).getTime();

          const prev = byTutor[tutorId];
          if (!prev || startAtMs < prev.startAtMs) {
            byTutor[tutorId] = { date, time, startAtMs };
          }
        });

        if (!cancelled) setMap(byTutor);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [days]);

  return { map, loading };
}
