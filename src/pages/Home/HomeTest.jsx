// pages/Home/HomeTest.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HomeTest() {
  const navigate = useNavigate();
  const { setDevRole, DEV_AUTH_BYPASS } = useAuth();

  const chooseRole = (r) => {
    if (DEV_AUTH_BYPASS) {
      setDevRole(r);
      navigate(`/${r}`);
    } else {
      navigate("/"); // if someone hits this with real auth on
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "3rem auto", textAlign: "center" }}>
      <h1 style={{ marginBottom: "1rem" }}>Daresni (Dev Mode)</h1>
      <p style={{ marginBottom: "2rem", color: "#555" }}>
        Pick a role to jump into the app without logging in:
      </p>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button
          onClick={() => chooseRole("student")}
          style={{ padding: "0.8rem 1.2rem", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}
        >
          Continue as Student
        </button>
        <button
          onClick={() => chooseRole("tutor")}
          style={{ padding: "0.8rem 1.2rem", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}
        >
          Continue as Tutor
        </button>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: 12, color: "#888" }}>
        (Real login is disabled in dev mode. We’ll re-enable it later.)
      </p>
    </div>
  );
}
