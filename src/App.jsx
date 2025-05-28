import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import StudentDashboard from './pages/StudentDashboard'
import TutorDashboard from './pages/TutorDashBoard'
import ThemeToggle from './components/ThemeToggle'
import './App.css'

function Home() {
  return <h2>Home Page</h2>
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <Link to="/">Home</Link> |{' '}
          <Link to="/student">Student Dashboard</Link> |{' '}
          <Link to="/tutor">Tutor Dashboard</Link> |{' '}
          <ThemeToggle />
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/tutor" element={<TutorDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
