import React from 'react';
import './TutorCard.css';
import { useNavigate } from 'react-router-dom';

const TutorCard = ({ tutor }) => {
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate(`/tutor/${tutor.id}`, { state: { tutor } });
  };

  return (
    <div className="tutor-card-row">
      <img src={tutor.image} alt={tutor.name} className="avatar-sm" />
      <div className="tutor-details">
        <h3>{tutor.name} <span className="verified">✔️</span></h3>
        <p className="expertise">{tutor.expertise}</p>
        <p className="location">📍 {tutor.location}</p>
      </div>
      <div className="price-rating">
        <p className="price">BHD {tutor.price}</p>
        <p className="stars">⭐ {tutor.rating}</p>
      </div>
      <button className="view-btn" onClick={goToProfile}>
        View Profile
      </button>
    </div>
  );
};

export default TutorCard;
