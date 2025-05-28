import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 })
  const containerRef = useRef(null)
  const buttonsRef = useRef({})

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'tutors', label: 'Tutors' },
    { id: 'history', label: 'History' },
  ]

  // Update highlight position when activeTab changes or window resizes
  useEffect(() => {
    const updateHighlight = () => {
      const btn = buttonsRef.current[activeTab]
      const container = containerRef.current
      if (btn && container) {
        const btnRect = btn.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        setHighlightStyle({
          left: btnRect.left - containerRect.left,
          width: btnRect.width,
        })
      }
    }

    updateHighlight()
    window.addEventListener('resize', updateHighlight)
    return () => window.removeEventListener('resize', updateHighlight)
  }, [activeTab])

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <>
            <h2>Upcoming Sessions</h2>
            <p>No upcoming sessions.</p>
          </>
        )
      case 'tutors':
        return (
          <>
            <h2>Suggested Tutors</h2>
            <p>Loading tutors...</p>
          </>
        )
      case 'history':
        return (
          <>
            <h2>Session History</h2>
            <p>No past sessions.</p>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <nav
        ref={containerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          background: 'var(--bg-tabs)',
          padding: '0.5rem',
          borderRadius: '999px',
          marginBottom: '1rem',
          position: 'relative',
          userSelect: 'none',
        }}
        aria-label="Student dashboard tabs"
      >
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
              zIndex: 1,
              transition: 'color 0.3s ease',
            }}
            onFocus={(e) => (e.target.style.outline = 'none')}
            onMouseOver={(e) => {
              if (activeTab !== tab.id)
                e.currentTarget.style.color = 'var(--color-active-tab-text)'
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id)
                e.currentTarget.style.color = 'var(--color-tab-text)'
            }}
            aria-current={activeTab === tab.id ? 'true' : 'false'}
          >
            {tab.label}
          </button>
        ))}

        {/* Sliding background highlight */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: highlightStyle.left,
            width: highlightStyle.width,
            backgroundColor: 'var(--bg-active-tab)',
            borderRadius: '999px',
            zIndex: 0,
          }}
        />
      </nav>

      <section>{renderContent()}</section>
    </div>
  )
}
