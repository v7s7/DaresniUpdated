import React, { useState, useEffect } from 'react';

// Mock functions to simulate saving and fetching data from localStorage
const saveProfileToLocalStorage = (profile) => {
  localStorage.setItem('studentProfile', JSON.stringify(profile));
};

const getProfileFromLocalStorage = () => {
  const profile = localStorage.getItem('studentProfile');
  return profile ? JSON.parse(profile) : null;
};

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    email: '',
    image: ''
  });
  
  const userId = 'user123'; // Mock user ID for testing purposes

  // Fetch profile data from localStorage when the component mounts
  useEffect(() => {
    const profileData = getProfileFromLocalStorage();
    if (profileData) {
      setProfile(profileData); // If profile exists in localStorage, set it
    } else {
      // If no profile data, initialize with default values
      setProfile({
        name: '',
        bio: '',
        phone: '',
        location: '',
        email: 'user@example.com',
        image: '', // placeholder image URL or add one if needed
      });
    }
  }, []);

  // Handle input changes for the form
  const handleChange = (e) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save profile to localStorage when the user submits the form
  const handleSave = (e) => {
    e.preventDefault();
    saveProfileToLocalStorage(profile); // Save updated profile to localStorage
    alert('Profile saved!');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      {/* Form to display and update profile */}
      <form onSubmit={handleSave}>
        <div>
          <label>
            Full Name:
            <input
              type="text"
              name="name"
              value={profile.name || ''}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </label>
        </div>
        <div>
          <label>
            Bio:
            <textarea
              name="bio"
              value={profile.bio || ''}
              onChange={handleChange}
              rows="3"
              placeholder="Tell us about yourself"
            />
          </label>
        </div>
        <div>
          <label>
            Phone:
            <input
              type="text"
              name="phone"
              value={profile.phone || ''}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </label>
        </div>
        <div>
          <label>
            Location:
            <input
              type="text"
              name="location"
              value={profile.location || ''}
              onChange={handleChange}
              placeholder="Enter your location"
            />
          </label>
        </div>
        <div>
          <label>
            Email:
            {/* Display email as plain text */}
            <p>{profile.email}</p>
          </label>
        </div>
        <div>
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
