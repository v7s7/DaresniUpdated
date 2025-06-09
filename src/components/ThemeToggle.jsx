import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  // Set the initial state based on localStorage (if theme is saved in the browser)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'; // Check if the theme in localStorage is 'dark'
  });

  useEffect(() => {
    // If dark mode is enabled, add 'dark' class to the HTML element
    // If dark mode is disabled, remove the 'dark' class
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Save 'dark' in localStorage
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Save 'light' in localStorage
    }
  }, [darkMode]); // This effect runs whenever darkMode changes

  return (
    <button
      onClick={() => setDarkMode(!darkMode)} // Toggle dark mode when the button is clicked
      style={{
        marginLeft: '1rem',
        padding: '0.25rem 0.5rem',
        cursor: 'pointer', // Change the cursor to a pointer when hovering over the button
      }}
    >
      {/* Display different text and icons based on the current theme */}
      {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
