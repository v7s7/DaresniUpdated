// src/pages/DevSeed.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const MIRROR_USERS = true; // turn true only if your /users rules allow dev writes

function iso(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DevSeed() {
  const [log, setLog] = useState([]);
  const [bypassOn, setBypassOn] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [uid, setUid] = useState(null);

  const append = (line) =>
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}  ${line}`]);

  // Ensure anon auth
  useEffect(() => {
    setBypassOn(localStorage.getItem("DEV_BYPASS") === "true");

    const unsub = onAuthStateChanged(auth, (u) => {
      const ok = !!u;
      setAuthed(ok);
      setUid(u ? u.uid : null);
      append(ok ? `Auth: signed in (uid=${(u && u.uid ? u.uid : "").slice(0, 6)}…)` : "Auth: signed out");
    });

    // Try sign-in if not already signed in
    if (!auth.currentUser) {
      signInAnonymously(auth)
        .then(() => append("Auth: anonymous sign-in requested"))
        .catch((e) => append(`Auth error: ${e.code || e.name} - ${e.message}`));
    }

    return () => unsub();
  }, []);

  async function reSignInAnon() {
    try {
      await signOut(auth);
      append("Auth: signed out");
      await signInAnonymously(auth);
      append("Auth: anonymous sign-in requested");
    } catch (e) {
      append(`Auth error: ${e.code || e.name} - ${e.message}`);
    }
  }

  function requireAuth() {
    if (!auth.currentUser) {
      append("Not signed in — enable Anonymous Auth and click 'Re-sign in anon'.");
      return false;
    }
    return true;
  }

  // ---- Diagnostics ----
  async function testWrite() {
    try {
      if (!requireAuth()) return;
      append("Testing write to /diagnostic/_ping …");
      await setDoc(doc(db, "diagnostic", "_ping"), {
        at: new Date().toISOString(),
        by: auth.currentUser.uid,
      });
      append("Test write OK ✅");
    } catch (e) {
      append(`Test write FAILED ❌  ${e.code || e.name}: ${e.message}`);
    }
  }

  // ---- Seed actions ----
  async function seedTutors() {
    if (!requireAuth()) return;
    try {
      append("Seeding tutors…");
      await setDoc(doc(db, "tutors", "tutor_1"), {
        name: "Sara Ahmed",
        expertise: "Math",
        price: 12,
        location: "Manama",
        rating: 4.7,
        image: "",
        subjects: [
          { name: "Algebra", pricePerHour: 12 },
          { name: "Calculus", pricePerHour: 15 },
        ],
        verified: true,
        seededBy: auth.currentUser.uid,
      });
      await setDoc(doc(db, "tutors", "tutor_2"), {
        name: "Omar Ali",
        expertise: "English",
        price: 10,
        location: "Muharraq",
        rating: 4.5,
        image: "",
        subjects: [
          { name: "Grammar", pricePerHour: 10 },
          { name: "Writing", pricePerHour: 11 },
        ],
        verified: false,
        seededBy: auth.currentUser.uid,
      });

      if (MIRROR_USERS) {
        await setDoc(doc(db, "users", "tutor_1"), {
          role: "tutor",
          name: "Sara Ahmed",
          expertise: "Math",
          price: 12,
          location: "Manama",
          rating: 4.7,
          image: "",
          subjects: [
            { name: "Algebra", pricePerHour: 12 },
            { name: "Calculus", pricePerHour: 15 },
          ],
          verified: true,
          seededBy: auth.currentUser.uid,
        });
        await setDoc(doc(db, "users", "tutor_2"), {
          role: "tutor",
          name: "Omar Ali",
          expertise: "English",
          price: 10,
          location: "Muharraq",
          rating: 4.5,
          image: "",
          subjects: [
            { name: "Grammar", pricePerHour: 10 },
            { name: "Writing", pricePerHour: 11 },
          ],
          verified: false,
          seededBy: auth.currentUser.uid,
        });
      }

      append("Tutors seeded ✅");
    } catch (e) {
      append(`Error: ${e.code || e.name} - ${e.message}`);
    }
  }

  async function seedAvailability() {
    if (!requireAuth()) return;
    try {
      append("Seeding availability for next 2 days…");
      const d0 = iso(1); // tomorrow
      const d1 = iso(2); // day after

      await setDoc(doc(db, "availabilities", `tutor_1_${d0}`), {
        tutorId: "tutor_1",
        date: d0,
        slots: ["10:00", "11:00", "14:00"],
        seededBy: auth.currentUser.uid,
      });
      await setDoc(doc(db, "availabilities", `tutor_1_${d1}`), {
        tutorId: "tutor_1",
        date: d1,
        slots: ["09:00", "13:00"],
        seededBy: auth.currentUser.uid,
      });
      await setDoc(doc(db, "availabilities", `tutor_2_${d0}`), {
        tutorId: "tutor_2",
        date: d0,
        slots: ["16:00", "17:00"],
        seededBy: auth.currentUser.uid,
      });

      append("Availability seeded ✅");
    } catch (e) {
      append(`Error: ${e.code || e.name} - ${e.message}`);
    }
  }

  async function clearSeed() {
    if (!requireAuth()) return;
    try {
      append("Clearing seeded data…");

      await deleteDoc(doc(db, "tutors", "tutor_1"));
      await deleteDoc(doc(db, "tutors", "tutor_2"));
      if (MIRROR_USERS) {
        await deleteDoc(doc(db, "users", "tutor_1"));
        await deleteDoc(doc(db, "users", "tutor_2"));
      }

      const toDelete = [];
      for (let i = -1; i <= 7; i++) {
        const d = iso(i);
        toDelete.push(deleteDoc(doc(db, "availabilities", `tutor_1_${d}`)));
        toDelete.push(deleteDoc(doc(db, "availabilities", `tutor_2_${d}`)));
      }
      await Promise.allSettled(toDelete);

      // delete bookings for these tutors
      const q1 = query(
        collection(db, "bookings"),
        where("tutorId", "in", ["tutor_1", "tutor_2"])
      );
      const snap = await getDocs(q1);
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "bookings", d.id))));

      append("Seeded data cleared ✅");
    } catch (e) {
      append(`Error: ${e.code || e.name} - ${e.message}`);
    }
  }

  function enableBypass() {
    localStorage.setItem("DEV_BYPASS", "true");
    setBypassOn(true);
    append("DEV_BYPASS enabled — open /student and /tutor without login.");
  }
  function disableBypass() {
    localStorage.removeItem("DEV_BYPASS");
    setBypassOn(false);
    append("DEV_BYPASS disabled.");
  }

  return (
    <div style={{ maxWidth: 760, margin: "20px auto", padding: 16 }}>
      <h2>Dev Seed</h2>
      <p>
        Auth: <strong>{authed ? "ON" : "OFF"}</strong>
        {authed && uid
          ? ` (anonymous uid=${uid.slice(0, 6)}…)`
          : " — enable Anonymous Auth & click 'Re-sign in anon' if needed"}
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={reSignInAnon} style={btn}>Re-sign in anon</button>
        <button onClick={testWrite} style={btn}>Test write</button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={seedTutors} style={btn}>Seed Tutors</button>
        <button onClick={seedAvailability} style={btn}>Seed Availability (2 days)</button>
        <button onClick={clearSeed} style={{ ...btn, background: "#fee2e2", borderColor: "#fecaca" }}>
          Clear Seeded Data
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "12px 0" }}>
        <span style={{ fontWeight: 600 }}>DEV Route Bypass:</span>
        {bypassOn ? (
          <button onClick={disableBypass} style={{ ...btn, background: "#fde68a", borderColor: "#fcd34d" }}>
            Disable
          </button>
        ) : (
          <button onClick={enableBypass} style={{ ...btn, background: "#d1fae5", borderColor: "#a7f3d0" }}>
            Enable
          </button>
        )}
        <span>{bypassOn ? "ON" : "OFF"}</span>
      </div>

      <div style={logBox}>
        {log.map((l, i) => (
          <div key={i} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas" }}>
            {l}
          </div>
        ))}
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ lineHeight: 1.6 }}>
        <div><strong>Next:</strong></div>
        <div>1) Click <em>Test write</em>. If it says “OK ✅”, seeding will work.</div>
        <div>2) Seed Tutors → Seed Availability → go to <code>/home</code>.</div>
        <div>3) Book via tutor profile → approve in <code>/tutor</code> → see in <code>/student</code>.</div>
      </div>
    </div>
  );
}

const btn = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#e5e7eb",
  cursor: "pointer",
  fontWeight: 600,
};

const logBox = {
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  borderRadius: 8,
  minHeight: 120,
  padding: 12,
  overflow: "auto",
};
