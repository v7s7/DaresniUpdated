import { useState, useRef, useEffect } from 'react';

export default function AdminPage() {
  // Tabs array with Tutors, Students, Institutes, Dashboard, and Settings
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tutors', label: 'Tutors' },
    { id: 'students', label: 'Students' },
    { id: 'institutes', label: 'Institutes' },
    { id: 'settings', label: 'Settings' }
  ];

  const [activeTab, setActiveTab] = useState('dashboard');
  const [fade, setFade] = useState(true);
  const buttonsRef = useRef({});
  const highlightRef = useRef();

  // Effect to position the highlight bar based on the active tab
  useEffect(() => {
    const activeBtn = buttonsRef.current[activeTab];
    if (activeBtn && highlightRef.current) {
      const rect = activeBtn.getBoundingClientRect();
      const parentRect = activeBtn.parentElement.getBoundingClientRect();
      highlightRef.current.style.width = `${rect.width}px`;
      highlightRef.current.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    }
  }, [activeTab]);

  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 150);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  // Render the content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <p>Welcome to the admin dashboard.</p>;
      case 'tutors':
        return <p>Manage tutors here.</p>;
      case 'students':
        return <p>Manage students here.</p>;
      case 'institutes':
        return <p>Manage institutes here.</p>;
      case 'settings':
        return <p>Configure your application settings here.</p>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          background: 'var(--bg-tabs)', // Set background for tabs
          padding: '0.5rem',
          borderRadius: '999px',
          marginBottom: '1rem',
          userSelect: 'none',
        }}
      >
        <div
          ref={highlightRef}
          style={{
            position: 'absolute',
            top: '0.5rem',
            left: 0,
            height: '2.5rem',
            backgroundColor: 'var(--bg-active-tab)', // Active tab highlight color
            borderRadius: '999px',
            pointerEvents: 'none',
            zIndex: 0,
            transition:
              'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth transition
          }}
        />
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
            onFocus={(e) => (e.target.style.outline = 'none')}
            onMouseEnter={(e) => {
              const bg = e.currentTarget.querySelector('.hover-bg');
              if (bg && activeTab !== tab.id) bg.style.opacity = '0.15';
            }}
            onMouseLeave={(e) => {
              const bg = e.currentTarget.querySelector('.hover-bg');
              if (bg) bg.style.opacity = '0';
            }}
          >
            {tab.label}
            <span
              className="hover-bg"
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
