import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="navbar">
      <button
        className={activeTab === 'upcoming' ? 'active' : ''}
        onClick={() => setActiveTab('upcoming')}
      >
        Upcoming
      </button>
      <button
        className={activeTab === 'tutors' ? 'active' : ''}
        onClick={() => setActiveTab('tutors')}
      >
        Tutors
      </button>
      <button
        className={activeTab === 'history' ? 'active' : ''}
        onClick={() => setActiveTab('history')}
      >
        History
      </button>
    </div>
  );
};

export default Navbar;
