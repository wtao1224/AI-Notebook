import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { NotepadProvider } from './context/NotepadContext'
import Layout from './components/Layout'
import AIChat from './components/AIChat'
import PomodoroTimer from './components/PomodoroTimer'
import ProjectManagement from './components/ProjectManagement'

function App() {
  return (
    <NotepadProvider>
      <Router>
        <div className="h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Layout />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/pomodoro" element={<PomodoroTimer />} />
            <Route path="/project-management" element={<ProjectManagement />} />
          </Routes>
        </div>
      </Router>
    </NotepadProvider>
  )
}

export default App