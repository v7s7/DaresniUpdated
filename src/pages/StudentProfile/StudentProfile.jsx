import React, { useState } from 'react';
import './StudentProfile.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: 'Jane Doe',
    bio: 'I love learning new things and connecting with tutors.',
    phone: '+973 1234 5678',
    location: 'Manama, Bahrain',
    email: 'janedoe@example.com'
  });

  const handleChange = (e) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Preview mode: changes not saved.');
  };

  return (
    <div className="student-profile-container">
      <aside className="student-profile-sidebar">
        <h2>My Menu</h2>
        <ul>
          <li>Edit Profile</li>
          <li>My Tutors</li>
          <li>My Bookings</li>
          <li>Settings</li>
        </ul>
      </aside>

      <main className="student-profile-content">
        <h1>My Profile</h1>
        <form onSubmit={handleSave} className="student-profile-form">
          <label>
            Full Name:
            <input type="text" name="name" value={profile.name} onChange={handleChange} />
          </label>
          <label>
            Email:
            <input type="email" value={profile.email} disabled />
          </label>
          <label>
            Bio:
            <textarea name="bio" value={profile.bio} onChange={handleChange} rows="3" />
          </label>
          <label>
            Phone:
            <input type="text" name="phone" value={profile.phone} onChange={handleChange} />
          </label>
          <label>
            Location:
            <input type="text" name="location" value={profile.location} onChange={handleChange} />
          </label>
          <button type="submit">Save Changes</button>
        </form>
      </main>
    </div>
  );
};

export default StudentProfile;
