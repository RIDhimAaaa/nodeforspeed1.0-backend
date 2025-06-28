import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AuthForms from "./components/AuthForms"
import Navigation from "./components/Navigation"
import Dashboard from "./pages/Dashboard"
import NewNote from "./pages/NewNote"
import Archive from "./pages/Archive"
import Revise from "./pages/Revise"
import { apiService } from "./services/api"
import "./App.css"

function App() {
  const [notes, setNotes] = useState([])
  const [archivedNotes, setArchivedNotes] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch notes from backend
  const fetchNotes = async () => {
    try {
      setIsLoading(true)
      setError("")
      const notesRes = await apiService.getNotes()
      setNotes(notesRes.notes || [])
      const archivedRes = await apiService.getArchivedNotes()
      setArchivedNotes(archivedRes.archived_notes || [])
    } catch (err) {
      setError(err.message || "Failed to fetch notes")
    } finally {
      setIsLoading(false)
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (token && apiService.isAuthenticated()) {
          setIsAuthenticated(true)
          setUser({ username: 'User' }) // Placeholder
          await fetchNotes()
        }
      } catch (error) {
        apiService.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  // On login, fetch notes and set authenticated
  const handleLogin = async (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    await fetchNotes()
  }

  const handleLogout = () => {
    apiService.clearTokens()
    setIsAuthenticated(false)
    setUser(null)
    setNotes([])
    setArchivedNotes([])
  }

  // Add note via backend
  const addNote = async (noteData) => {
    try {
      setIsLoading(true)
      setError("")
      // Convert decayTime (ms) to minutes for backend
      const decay_minutes = Math.round((noteData.decayTime || 5 * 60 * 1000) / 60000)
      const res = await apiService.createNote({
        title: noteData.title,
        content: noteData.content,
        decay_minutes,
      })
      await fetchNotes()
      return res.note
    } catch (err) {
      setError(err.message || "Failed to create note")
    } finally {
      setIsLoading(false)
    }
  }

  // Revise note (AI-powered)
  const reviseNote = async (noteId, newDecayTime) => {
    // This will be handled in Revise.jsx using AI endpoints
    await fetchNotes()
  }

  // Revive note from archive (AI-powered)
  const reviveNote = async (noteId, questionIndex, answer) => {
    try {
      setIsLoading(true)
      setError("")
      await apiService.reviveNote(noteId, questionIndex, answer)
      await fetchNotes()
    } catch (err) {
      setError(err.message || "Failed to revive note")
    } finally {
      setIsLoading(false)
    }
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }
    return isAuthenticated ? children : <Navigate to="/auth" replace />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-white w-full full-width-app">
        {isAuthenticated && <Navigation onLogout={handleLogout} user={user} />}
        <main className="w-full px-6 py-8 full-width-main">
          <Routes>
            {/* Auth Routes */}
            <Route 
              path="/auth" 
              element={
                !isAuthenticated ? (
                  <AuthForms onLogin={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard notes={notes} onRevise={reviseNote} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/new" 
              element={
                <ProtectedRoute>
                  <NewNote onAddNote={addNote} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/archive" 
              element={
                <ProtectedRoute>
                  <Archive archivedNotes={archivedNotes} onRevive={reviveNote} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/revise/:id" 
              element={
                <ProtectedRoute>
                  <Revise notes={notes} onRevise={reviseNote} fetchNotes={fetchNotes} />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirects */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
