import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">
      <button
        className={isActive('/student') ? 'active' : ''}
        onClick={() => navigate('/student')}
      >
        Upcoming
      </button>
      <button
        className={isActive('/student/tutors') ? 'active' : ''}
        onClick={() => navigate('/student/tutors')}
      >
        Tutors
      </button>
      <button
        className={isActive('/student/history') ? 'active' : ''}
        onClick={() => navigate('/student/history')}
      >
        History
      </button>
    </div>
  );
};

export default Navbar;
