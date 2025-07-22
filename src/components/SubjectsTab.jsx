import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function SubjectsTab() {
  const [user] = useAuthState(auth);
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSubjects(data.subjects || []);
      }
    };
    fetchSubjects();
  }, [user]);

  const handleAddSubject = async () => {
    if (!subjectName || !pricePerHour) {
      alert("Please fill all fields.");
      return;
    }
    const newSubject = { name: subjectName, pricePerHour: Number(pricePerHour) };

    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);

    try {
      await updateDoc(doc(db, "users", user.uid), { subjects: updatedSubjects });
      setSubjectName("");
      setPricePerHour("");
    } catch (err) {
      console.error("Error adding subject:", err);
      alert("Failed to add subject.");
    }
  };

  const handleDeleteSubject = async (index) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
    await updateDoc(doc(db, "users", user.uid), { subjects: updatedSubjects });
  };

  return (
    <div className="card">
      <h3>📚 Manage Your Subjects</h3>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Subject Name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <input
          type="number"
          placeholder="Price per Hour (BHD)"
          value={pricePerHour}
          onChange={(e) => setPricePerHour(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <button onClick={handleAddSubject}>➕ Add</button>
      </div>

      {subjects.length === 0 ? (
        <p>No subjects added yet.</p>
      ) : (
        <ul>
          {subjects.map((sub, i) => (
            <li key={i}>
              {sub.name} - BHD {sub.pricePerHour}/hour{" "}
              <button onClick={() => handleDeleteSubject(i)}>❌ Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
