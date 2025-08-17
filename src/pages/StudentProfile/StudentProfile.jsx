import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import './StudentProfile.css';

const StudentProfile = () => {
  const [user] = useAuthState(auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
    email: '',
    image: ''
  });

  // Load from Firestore (users/{uid}); initialize doc if missing
  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: data.name || '',
            bio: data.bio || '',
            phone: data.phone || '',
            location: data.location || '',
            email: data.email || user.email || '',
            image: data.image || ''
          });
        } else {
          await setDoc(
            ref,
            {
              email: user.email || '',
              role: 'student',
              name: '',
              bio: '',
              phone: '',
              location: '',
              image: ''
            },
            { merge: true }
          );
          setProfile((p) => ({ ...p, email: user.email || '' }));
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        name: profile.name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        image: profile.image || ''
      }).catch(async (err) => {
        // if doc doesn't exist yet
        if (String(err).toLowerCase().includes('no document')) {
          await setDoc(
            ref,
            {
              email: user.email || '',
              role: 'student',
              name: profile.name || '',
              bio: profile.bio || '',
              phone: profile.phone || '',
              location: profile.location || '',
              image: profile.image || ''
            },
            { merge: true }
          );
        } else {
          throw err;
        }
      });
    } catch (e) {
      console.error(e);
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="student-profile-container" style={{ textAlign: 'center' }}>
        Loading profile…
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: 8
          }}
        >
          {error}
        </div>
      )}

      {/* Header */}
      <div className="student-profile-header">
        <img
          src={
            profile.image?.trim()
              ? profile.image
              : 'https://daresni.net/website_assets/images/user.jpg'
          }
          alt={profile.name || 'Student'}
        />
        <div className="student-profile-info">
          <h2 style={{ margin: 0 }}>{profile.name || 'Your Name'}</h2>
          <div style={{ color: '#666' }}>{profile.email || '—'}</div>
          {profile.location && <div>📍 {profile.location}</div>}
        </div>
      </div>

      {/* Form */}
      <form className="student-profile-form" onSubmit={handleSave}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={profile.name || ''}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
            Bio
          </label>
          <textarea
            name="bio"
            value={profile.bio || ''}
            onChange={handleChange}
            rows="3"
            placeholder="Tell us about yourself"
          />
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={profile.phone || ''}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={profile.location || ''}
              onChange={handleChange}
              placeholder="Enter your location"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
            Email (read-only)
          </label>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 6,
              border: '1px solid #eee',
              background: '#f9fafb',
              color: '#374151'
            }}
          >
            {profile.email || '—'}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
            Profile Image URL
          </label>
          <input
            type="text"
            name="image"
            value={profile.image || ''}
            onChange={handleChange}
            placeholder="https://…"
          />
        </div>

        <div>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
