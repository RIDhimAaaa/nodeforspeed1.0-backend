import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navigation from "./components/Navigation"
import Dashboard from "./pages/Dashboard"
import NewNote from "./pages/NewNote"
import Archive from "./pages/Archive"
import Revise from "./pages/Revise"
import "./App.css"

function App() {
  const [notes, setNotes] = useState([])
  const [archivedNotes, setArchivedNotes] = useState([])

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("memoryDecayNotes")
    const savedArchived = localStorage.getItem("memoryDecayArchived")

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
    if (savedArchived) {
      setArchivedNotes(JSON.parse(savedArchived))
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("memoryDecayNotes", JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem("memoryDecayArchived", JSON.stringify(archivedNotes))
  }, [archivedNotes])

  // Check for expired notes every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const expiredNotes = notes.filter((note) => now > note.expiresAt)
      const activeNotes = notes.filter((note) => now <= note.expiresAt)

      if (expiredNotes.length > 0) {
        setArchivedNotes((prev) => [...prev, ...expiredNotes])
        setNotes(activeNotes)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [notes])

  const addNote = (noteData) => {
    const newNote = {
      id: Date.now(),
      ...noteData,
      createdAt: Date.now(),
      expiresAt: Date.now() + noteData.decayTime,
    }
    setNotes((prev) => [...prev, newNote])
  }

  const reviseNote = (id, newDecayTime) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, expiresAt: Date.now() + newDecayTime, revisedAt: Date.now() } : note,
      ),
    )
  }

  const reviveNote = (id) => {
    const noteToRevive = archivedNotes.find((note) => note.id === id)
    if (noteToRevive) {
      const revivedNote = {
        ...noteToRevive,
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes default
      }
      setNotes((prev) => [...prev, revivedNote])
      setArchivedNotes((prev) => prev.filter((note) => note.id !== id))
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-white w-full full-width-app">
        <Navigation />
        <main className="w-full px-6 py-8 full-width-main">
          <Routes>
            <Route path="/" element={<Dashboard notes={notes} onRevise={reviseNote} />} />
            <Route path="/dashboard" element={<Dashboard notes={notes} onRevise={reviseNote} />} />
            <Route path="/new" element={<NewNote onAddNote={addNote} />} />
            <Route path="/archive" element={<Archive archivedNotes={archivedNotes} onRevive={reviveNote} />} />
            <Route path="/revise/:id" element={<Revise notes={notes} onRevise={reviseNote} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
