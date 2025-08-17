// components/Navbar.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, role, clearDevRole, DEV_AUTH_BYPASS } = useAuth();

  const handleSignOut = async () => {
    if (DEV_AUTH_BYPASS) {
      clearDevRole();
      navigate('/home');
    } else {
      // real sign out path when you re-enable auth
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      await signOut(auth);
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    if (role === 'tutor') navigate('/tutor/profile');
    else navigate('/student/profile');
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <h1 style={{ cursor: "pointer" }} onClick={() => navigate('/home')}>DARESNI</h1>
      </div>

      <div className="nav-right">
        {user && (
          <div className="hamburger-menu">
            <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            {menuOpen && (
              <div className="dropdown-menu">
                <button onClick={handleProfileClick}>Profile</button>
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
