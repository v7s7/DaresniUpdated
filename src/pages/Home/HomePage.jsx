import React from 'react';
import TutorCard from '../../components/TutorCard';
import './HomePage.css';

const dummyTutors = [
  {
    id: 1,
    name: 'Adam Johnson',
    expertise: 'Web Development',
    location: 'Kingdom of Bahrain',
    price: 9,
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    name: 'Abdul Malik',
    expertise: 'Web Development',
    location: 'Kingdom of Bahrain',
    price: 9,
    rating: 4.5,
    image: 'https://randomuser.me/api/portraits/men/33.jpg',
  },
  {
    id: 3,
    name: 'Zachary Lee',
    expertise: 'Web Development',
    location: 'Kingdom of Bahrain',
    price: 9,
    rating: 4.7,
    image: 'https://randomuser.me/api/portraits/men/34.jpg',
  },
];

export default function HomePage() {
  return (
    <div className="home-container">
      <header className="header">
        <h1>DARESNI</h1>
        <div className="cart-icon">🛒</div>
      </header>

      <div className="search-bar">
        <input type="text" placeholder="Search here..." />
      </div>

      <h2 className="section-title">Tutors & Coaches List</h2>

      <div className="tutor-list">
        {dummyTutors.map((tutor) => (
<TutorCard key={tutor.id} tutor={tutor} onViewProfile={() => handleViewProfile(tutor)} />
          
        ))}
      </div>
    </div>
  );
}
