import { useState, useRef, useEffect } from 'react';

export default function TutorDashboard() {
  // Tab definitions
  const tabs = [
    { id: 'requests', label: 'Requests' },
    { id: 'Upcoming', label: 'Upcoming' },
    { id: 'history', label: 'History' },
  ];

  const [activeTab, setActiveTab] = useState('requests'); // Track current tab
  const [fade, setFade] = useState(true); // Handle fade animation
  const buttonsRef = useRef({}); // Store tab button references
  const highlightRef = useRef(); // Ref for the active tab highlight bar

  // Move highlight bar to match active tab
  useEffect(() => {
    const activeBtn = buttonsRef.current[activeTab];
    if (activeBtn && highlightRef.current) {
      const rect = activeBtn.getBoundingClientRect();
      const parentRect = activeBtn.parentElement.getBoundingClientRect();
      highlightRef.current.style.width = `${rect.width}px`;
      highlightRef.current.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    }
  }, [activeTab]);

  // Animate fade on tab change
  useEffect(() => {
    setFade(false); // start fade out
    const timeout = setTimeout(() => setFade(true), 150); // fade in after delay
    return () => clearTimeout(timeout);
  }, [activeTab]);

  // Tab-specific content
  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return <p>No new session requests.</p>;
      case 'Upcoming':
        return <p>Your upcoming schedule will appear here.</p>;
      case 'history':
        return <p>No past sessions available.</p>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* Tab navigation container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          background: 'var(--bg-tabs)',
          padding: '0.5rem',
          borderRadius: '999px',
          marginBottom: '1rem',
          userSelect: 'none',
        }}
      >
        {/* Animated highlight for active tab */}
        <div
          ref={highlightRef}
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: 0,
            height: '2.5rem',
            backgroundColor: 'var(--bg-active-tab)',
            borderRadius: '999px',
            pointerEvents: 'none',
            zIndex: 0,
            transition:
              'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Render each tab button */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (buttonsRef.current[tab.id] = el)}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative',
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              border: 'none',
              background: 'transparent',
              color:
                activeTab === tab.id
                  ? 'var(--color-active-tab-text)'
                  : 'var(--color-tab-text)',
              cursor: 'pointer',
              fontWeight: '600',
              zIndex: 1,
              transition: 'color 0.3s ease',
            }}
            onFocus={(e) => (e.target.style.outline = 'none')} // Remove blue outline
            onMouseEnter={(e) => {
              const bg = e.currentTarget.querySelector('.hover-bg');
              if (bg && activeTab !== tab.id) bg.style.opacity = '0.15'; // Hover effect
            }}
            onMouseLeave={(e) => {
              const bg = e.currentTarget.querySelector('.hover-bg');
              if (bg) bg.style.opacity = '0'; // Reset hover
            }}
          >
            {tab.label}
            <span
              className="hover-bg" // Hover background layer
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '999px',
                backgroundColor: 'var(--bg-active-tab)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          </button>
        ))}
      </div>

      {/* Tab content section with fade transition */}
      <div
        key={activeTab}
        style={{
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.3s ease',
          minHeight: '2em',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
