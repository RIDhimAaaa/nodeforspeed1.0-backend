import { Link } from "react-router-dom"

const NoteCard = ({ note, onRevise }) => {
  const timeRemaining = note.expiresAt - Date.now()
  const isExpiringSoon = timeRemaining < 5 * 60 * 1000 // Less than 5 minutes

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return "Expired"

    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const handleQuickRevise = () => {
    onRevise(note.id, 30 * 60 * 1000) // Extend by 30 minutes
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 transition-all duration-300 hover:shadow-md ${
        isExpiringSoon ? "opacity-60 grayscale" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 truncate pr-3">{note.title}</h3>
        <div
          className={`px-3 py-2 rounded-full text-sm font-medium ${
            isExpiringSoon
              ? "bg-red-100 text-red-700"
              : timeRemaining < 30 * 60 * 1000
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {formatTimeRemaining(timeRemaining)}
        </div>
      </div>

      <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed">
        {note.content.length > 120 ? `${note.content.substring(0, 120)}...` : note.content}
      </p>

      <div className="flex space-x-3">
        <Link
          to={`/revise/${note.id}`}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-center py-3 px-6 rounded-lg text-base font-medium transition-colors duration-200"
        >
          Revise
        </Link>
        <button
          onClick={handleQuickRevise}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          +30m
        </button>
      </div>
    </div>
  )
}

export default NoteCard 