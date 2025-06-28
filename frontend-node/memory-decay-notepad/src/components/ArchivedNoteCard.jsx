const ArchivedNoteCard = ({ note, onRevive }) => {
  const formatDate = (timestamp) => {
    // Ensure timestamp is properly converted to Date
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60 hover:opacity-80 transition-opacity duration-300">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{note.title}</h3>
        <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Expired</div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Expired: {formatDate(note.expiresAt)}</span>
        <button
          onClick={() => onRevive(note.id)}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Revive
        </button>
      </div>
    </div>
  )
}

export default ArchivedNoteCard 