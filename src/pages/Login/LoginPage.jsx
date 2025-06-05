import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import googleIcon from './google.png';  // Import the image
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

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

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        await redirectBasedOnRole(user.uid);
      } else {
        setPendingGoogleUser(user); // Prompt for role selection if new user
      }
    } catch (err) {
      setError(err.message);
    }
  };

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

  const redirectBasedOnRole = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      if (role === 'student') {
        navigate('/student');
      } else if (role === 'tutor') {
        navigate('/tutor');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        setError('Role not assigned. Please contact support.');
      }
    } else {
      setError('User data not found.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {pendingGoogleUser ? (
        <form className="login-form" onSubmit={handleRoleSubmit}>
          <p>Select your role:</p>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">Select</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
            <option value="admin">Admin</option> {/* Added admin role */}
          </select>
          <button type="submit">Continue</button>
          {error && <p className="error">{error}</p>}
        </form>
      ) : (
        <>
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
          </form>
          <button onClick={handleGoogleSignIn} className="google-btn">
            <img src="https://id-frontend.prod-east.frontend.public.atl-paas.net/assets/google-logo.5867462c.svg" alt="Google" className="google-icon" />
            Sign in with Google
          </button>
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default LoginPage;
