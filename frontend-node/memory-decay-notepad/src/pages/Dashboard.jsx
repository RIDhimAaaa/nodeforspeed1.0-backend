import { Link } from "react-router-dom"
import NoteCard from "../components/NoteCard"

const Dashboard = ({ notes, onRevise }) => {
  const sortedNotes = [...notes].sort((a, b) => a.expiresAt - b.expiresAt)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard</h1>
          <p className="text-lg text-gray-600">
            {notes.length} active note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="/new"
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md text-lg"
        >
          + New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6">📝</div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3">No active notes</h3>
          <p className="text-lg text-gray-600 mb-8">Create your first note to get started</p>
          <Link
            to="/new"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200 text-lg"
          >
            Create Note
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {sortedNotes.map((note) => (
            <NoteCard key={note.id} note={note} onRevise={onRevise} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard 