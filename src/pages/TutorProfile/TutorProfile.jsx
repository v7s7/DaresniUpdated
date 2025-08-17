// src/pages/TutorProfile/TutorProfile.jsx
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import AvailabilityPicker from "../../components/AvailabilityPicker";

export default function TutorProfile() {
  const { id } = useParams();
  const location = useLocation();
  const stateTutor = location.state?.tutor || null;

  const [tutor, setTutor] = useState(stateTutor);
  const [loading, setLoading] = useState(!stateTutor);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (stateTutor) return;
      setLoading(true);
      setError("");
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) {
          setTutor({ id: snap.id, ...snap.data() });
        } else {
          setError("Tutor not found.");
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load tutor.");
      } finally {
        setLoading(false);
      }
    };
    if (!stateTutor) load();
  }, [id, stateTutor]);

  if (loading) return <div style={{ padding: "1rem" }}>Loading…</div>;
  if (error) return <div style={{ padding: "1rem", color: "#b91c1c" }}>{error}</div>;
  if (!tutor) return null;

  return (
    <div style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: "1rem",
        alignItems: "center",
        marginBottom: "1rem"
      }}>
        <img
          src={tutor.image || "https://daresni.net/website_assets/images/user.jpg"}
          alt={tutor.name || "Tutor"}
          style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <h2 style={{ margin: 0 }}>
            {tutor.name || "Unnamed Tutor"} {tutor.verified && <span title="Verified">✔️</span>}
          </h2>
          <div style={{ color: "#374151" }}>{tutor.expertise || "Expertise not set"}</div>
          {tutor.location && <div>📍 {tutor.location}</div>}
          <div style={{ marginTop: 8 }}>
            {tutor.price ? `BHD ${tutor.price}/hr` : "Price not set"} · ⭐ {tutor.rating || "N/A"}
          </div>
        </div>
      </div>

      {/* Subjects list (if present) */}
      {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h4 style={{ margin: "0 0 0.5rem" }}>Subjects</h4>
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {tutor.subjects.map((s, i) => (
              <li key={i}>
                {s.name} {s.pricePerHour != null && <span>— BHD {s.pricePerHour}/hr</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Availability + booking */}
      <AvailabilityPicker tutor={tutor} />
    </div>
  );
}
