import './TutorCard.css';
import { useNavigate } from 'react-router-dom';

const TutorCard = ({ tutor }) => {
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate(`/tutor/${tutor.id}`, { state: { tutor } });
  };

  const handleBookNow = () => {
    navigate(`/tutor/${tutor.id}`, { state: { tutor, autoBook: true } });
  };

  return (
    <div className="tutor-card-row">
      {/* Tutor Image */}
      <img
        src={tutor.image || "https://daresni.net/website_assets/images/user.jpg"}
        alt={tutor.name || "Tutor"}
        className="avatar-sm"
      />

      {/* Tutor Info */}
      <div className="tutor-details">
        <h3>
          {tutor.name || "Unnamed Tutor"}{" "}
          {tutor.verified && <span className="verified">✔️</span>}
        </h3>
        <p className="expertise">{tutor.expertise || "Expertise not set"}</p>
        {tutor.bio && (
          <p className="bio-preview">
            {tutor.bio.length > 50 ? tutor.bio.substring(0, 50) + "..." : tutor.bio}
          </p>
        )}
        {tutor.location && <p className="location">📍 {tutor.location}</p>}
      </div>

      {/* Price & Rating */}
      <div className="price-rating">
        <p className="price">
          {tutor.price ? `BHD ${tutor.price}/hr` : "Price not set"}
        </p>
        <p className="stars">⭐ {tutor.rating || "N/A"}</p>
      </div>

      {/* Buttons */}
      <div className="tutor-actions">
        <button className="view-btn" onClick={goToProfile}>
          View Profile
        </button>
        <button className="book-btn" onClick={handleBookNow}>
          Book Now
        </button>
      </div>
    </div>
  );
};

export default TutorCard;
