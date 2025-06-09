import { useState, useRef, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminPage() {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tutors', label: 'Tutors' },
    { id: 'students', label: 'Students' },
    { id: 'institutes', label: 'Institutes' },
    { id: 'settings', label: 'Settings' }
  ];

  const [loadingRoleChange, setLoadingRoleChange] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fade, setFade] = useState(true);
  const buttonsRef = useRef({});
  const highlightRef = useRef();
  const [users, setUsers] = useState([]);

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

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const generateId = () =>
    typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 10);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <p>Welcome to the admin dashboard.</p>;

      case 'tutors': {
  const tutors = users.filter(u => u.role === 'tutor');

  const handleRoleChange = async (id, newRole) => {
    try {
      setLoadingRoleChange(true);
      await updateDoc(doc(db, 'users', id), { role: newRole });
      setUsers(prev => prev.map(user => (user.id === id ? { ...user, role: newRole } : user)));
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setLoadingRoleChange(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const role = 'tutor';

    const exists = users.some(u => u.email === email);
    if (exists) {
      alert('User with this email already exists.');
      return;
    }

    try {
      const newDoc = doc(db, 'users', generateId());
      await setDoc(newDoc, { email, role });
      setUsers(prev => [...prev, { id: newDoc.id, email, role }]);
      alert('Tutor added!');
      e.target.reset();
    } catch (err) {
      console.error('Error adding tutor:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input name="email" placeholder="Email" required style={{ padding: '0.5rem' }} />
        <button type="submit">Add Tutor</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tutors.map(t => (
          <div key={t.id} style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'var(--bg-tab-item, #f0f0f0)',
            color: 'var(--text-tab-item, #333)',
            border: '1px solid var(--border-tab-item, #ddd)',
          }}>
            <strong>{t.email}</strong> <br />
            Role: {t.role}{' '}
            <select defaultValue={t.role} onChange={(e) => handleRoleChange(t.id, e.target.value)}>
              <option value="tutor">Tutor</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}



      case 'students': {
  const students = users.filter(u => u.role === 'student');

  const handleRoleChange = async (id, newRole) => {
    try {
      setLoadingRoleChange(true);
      await updateDoc(doc(db, 'users', id), { role: newRole });
      setUsers(prev => prev.map(user => (user.id === id ? { ...user, role: newRole } : user)));
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setLoadingRoleChange(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const role = 'student';

    const exists = users.some(u => u.email === email);
    if (exists) {
      alert('User with this email already exists.');
      return;
    }

    try {
      const newDoc = doc(db, 'users', generateId());
      await setDoc(newDoc, { email, role });
      setUsers(prev => [...prev, { id: newDoc.id, email, role }]);
      alert('Student added!');
      e.target.reset();
    } catch (err) {
      console.error('Error adding student:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input name="email" placeholder="Email" required style={{ padding: '0.5rem' }} />
        <button type="submit">Add Student</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {students.map(s => (
          <div key={s.id} style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'var(--bg-tab-item, #f0f0f0)',
            color: 'var(--text-tab-item, #333)',
            border: '1px solid var(--border-tab-item, #ddd)',
          }}>
            <strong>{s.email}</strong> <br />
            Role: {s.role}{' '}
            <select defaultValue={s.role} onChange={(e) => handleRoleChange(s.id, e.target.value)}>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}


      case 'institutes': {
  const institutes = users.filter(u => u.role === 'institute');

  const handleAddInstitute = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const role = 'institute';

    const exists = users.some(u => u.email === email);
    if (exists) {
      alert('Institute with this email already exists.');
      return;
    }

    try {
      const newDoc = doc(db, 'users', generateId());
      await setDoc(newDoc, { email, role });
      setUsers(prev => [...prev, { id: newDoc.id, email, role }]);
      alert('Institute added!');
      e.target.reset();
    } catch (err) {
      console.error('Error adding institute:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <form onSubmit={handleAddInstitute} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input name="email" placeholder="Email" required style={{ padding: '0.5rem' }} />
        <button type="submit">Add Institute</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {institutes.length ? (
          institutes.map(i => (
            <div key={i.id} style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'var(--bg-tab-item, #f0f0f0)',
              color: 'var(--text-tab-item, #333)',
              border: '1px solid var(--border-tab-item, #ddd)',
            }}>
              <strong>{i.email}</strong> <br />
              Role: {i.role}
            </div>
          ))
        ) : (
          <p>No institutes found.</p>
        )}
      </div>
    </div>
  );
}



      case 'settings':
        return <p>Configure your application settings here.</p>;

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1rem', position: 'relative' }}>
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
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
              color: activeTab === tab.id ? 'var(--color-active-tab-text)' : 'var(--color-tab-text)',
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

      {loadingRoleChange && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            padding: '1.5rem 2rem',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            zIndex: 9999,
          }}
        >
          Updating role...
        </div>
      )}

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
