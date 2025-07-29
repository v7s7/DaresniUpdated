import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import RequestsTab from "../components/RequestsTab";
import AvailabilityTab from "../components/AvailabilityTab";
import HistoryTab from "../components/HistoryTab";
import UpcomingTab from "../components/UpcomingTab";

export default function TutorDashboard() {
  const tabs = [
    { id: "requests", label: "Requests" },
    { id: "upcoming", label: "Upcoming" },
    { id: "availability", label: "Availability" },
    { id: "history", label: "History" },
  ];

  const [activeTab, setActiveTab] = useState("requests");
  const [fade, setFade] = useState(true);
  const buttonsRef = useRef({});
  const highlightRef = useRef();
  const navigate = useNavigate();

  const [user] = useAuthState(auth);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Fetch upcoming sessions
  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      if (!user) return;
      setLoading(true);

      const q = query(
        collection(db, "bookings"),
        where("tutorId", "==", user.uid),
        where("status", "==", "upcoming")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
      setLoading(false);
    };

    fetchUpcomingSessions();
  }, [user]);

  // Tab highlight animation
  useEffect(() => {
    const activeBtn = buttonsRef.current[activeTab];
    if (activeBtn && highlightRef.current) {
      const rect = activeBtn.getBoundingClientRect();
      const parentRect = activeBtn.parentElement.getBoundingClientRect();
      highlightRef.current.style.width = `${rect.width}px`;
      highlightRef.current.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    }
  }, [activeTab]);

  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "availability":
        return <AvailabilityTab />;
      case "requests":
        return <RequestsTab />;
      case "upcoming":
        return <UpcomingTab />;
      case "history":
        return <HistoryTab />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "1000px", margin: "auto" }}>
      {/* Dashboard Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Tutor Dashboard</h2>
        <button
          onClick={() => navigate("/tutor/profile")}
          style={{
            backgroundColor: "#1e3a8a",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          My Profile
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          background: "#f2f4f7",
          padding: "0.5rem",
          borderRadius: "999px",
          marginBottom: "1.5rem",
        }}
      >
        <div
          ref={highlightRef}
          style={{
            position: "absolute",
            top: "0.5rem",
            left: 0,
            height: "2.5rem",
            backgroundColor: "#e0e7ff",
            borderRadius: "999px",
            pointerEvents: "none",
            zIndex: 0,
            transition: "width 0.4s, transform 0.4s",
          }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (buttonsRef.current[tab.id] = el)}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: "relative",
              padding: "0.5rem 1.5rem",
              borderRadius: "999px",
              border: "none",
              background: "transparent",
              color: activeTab === tab.id ? "#1e3a8a" : "#555",
              fontWeight: "600",
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        key={activeTab}
        style={{
          opacity: fade ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
