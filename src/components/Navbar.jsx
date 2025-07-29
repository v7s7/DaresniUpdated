import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleProfileClick = () => {
    if (role === 'tutor') {
      navigate('/tutor/profile');
    } else {
      navigate('/student/profile');
    }
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <h1 ></h1>
      </div>

      <div className="nav-right">
        {user && (
          <div className="hamburger-menu">
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
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
