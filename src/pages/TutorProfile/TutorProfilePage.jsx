import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function TutorProfilePage() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const storage = getStorage();

  // Fetch tutor profile
  useEffect(() => {
    if (!user) return;

    const fetchTutor = async () => {
      try {
        const refDoc = doc(db, "users", user.uid);
        const snapshot = await getDoc(refDoc);

        if (snapshot.exists()) {
          setProfile(snapshot.data());
        } else {
          // Create a default profile if none exists
          await setDoc(refDoc, { role: "tutor", name: "", expertise: "", price: 0 });
          setProfile({ role: "tutor", name: "", expertise: "", price: 0 });
        }
      } catch (err) {
        console.error("Error fetching tutor profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save updates
  const handleSave = async () => {
    try {
      const refDoc = doc(db, "users", user.uid);
      await updateDoc(refDoc, profile);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error saving profile.");
    }
  };

  // Upload image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfile((prev) => ({ ...prev, image: url }));

      const refDoc = doc(db, "users", user.uid);
      await updateDoc(refDoc, { image: url });
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/tutor")}
        style={{
          background: "#1e3a8a",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "6px",
          marginBottom: "1rem",
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>

      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "1.5rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>My Tutor Profile</h2>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div>
            <img
              src={profile.image || "https://via.placeholder.com/120"}
              alt="Profile"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ marginTop: "0.5rem" }}
            />
            {uploading && <p>Uploading image...</p>}
          </div>

          <div style={{ flex: 1 }}>
            {editMode ? (
              <>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
                />

                <label>Expertise:</label>
                <input
                  type="text"
                  name="expertise"
                  value={profile.expertise || ""}
                  onChange={handleChange}
                  style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
                />

                <label>Price (BHD/hour):</label>
                <input
                  type="number"
                  name="price"
                  value={profile.price || ""}
                  onChange={handleChange}
                  style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
                />

                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
                />

                <label>Bio:</label>
                <textarea
                  name="bio"
                  rows="3"
                  value={profile.bio || ""}
                  onChange={handleChange}
                  style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
                />

                <button
                  onClick={handleSave}
                  style={{
                    background: "#1e3a8a",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "6px",
                    marginRight: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    background: "#ddd",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {profile.name || "N/A"}</p>
                <p><strong>Expertise:</strong> {profile.expertise || "N/A"}</p>
                <p><strong>Price:</strong> BHD {profile.price || "0"}/hour</p>
                <p><strong>Location:</strong> {profile.location || "N/A"}</p>
                <p><strong>Bio:</strong> {profile.bio || "No bio provided."}</p>
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: "#1e3a8a",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
