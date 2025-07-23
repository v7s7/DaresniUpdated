// LoginPage.jsx
// This page handles login using email/password or Google account
// It's part of a university senior project built using React and Firebase

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './LoginPage.css';

const LoginPage = () => {
  // State variables to manage form inputs and flow
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // Handle login with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await redirectBasedOnRole(user.uid);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle login with Google account
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        await redirectBasedOnRole(user.uid);
      } else {
        // If it's a new Google user, ask them to choose a role
        setPendingGoogleUser(user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Submit selected role for new Google user
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }

    try {
      await setDoc(doc(db, 'users', pendingGoogleUser.uid), {
        email: pendingGoogleUser.email,
        role: selectedRole,
      });

      await redirectBasedOnRole(pendingGoogleUser.uid);
    } catch (err) {
      setError(err.message);
    }
  };

  // Redirect user to appropriate dashboard based on their role
  const redirectBasedOnRole = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      if (role === 'student') navigate('/student');
      else if (role === 'tutor') navigate('/tutor');
      else if (role === 'admin') navigate('/admin');
      else setError('Role not assigned. Please contact support.');
    } else {
      setError('User data not found.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {pendingGoogleUser ? (
        // Show role selection form if user is new from Google login
        <form className="login-form" onSubmit={handleRoleSubmit}>
          <p>Select your role:</p>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">Select</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Continue</button>
          {error && <p className="error">{error}</p>}
        </form>
      ) : (
        <>
          {/* Regular email/password login form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
            {error && <p className="error">{error}</p>}

          {/* Google sign in button */}
          <button onClick={handleGoogleSignIn} className="google-btn">
            <img
              src="https://id-frontend.prod-east.frontend.public.atl-paas.net/assets/google-logo.5867462c.svg"
              alt="Google"
              className="google-icon"
            />
            Sign in with Google
          </button>
          </form>

          {/* Link to sign up page */}
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default LoginPage;
