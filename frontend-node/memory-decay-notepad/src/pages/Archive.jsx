import ArchivedNoteCard from "../components/ArchivedNoteCard"

const Archive = ({ archivedNotes, onRevive }) => {
  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Archived Notes</h1>
        <p className="text-lg text-gray-600">
          {archivedNotes.length} archived note{archivedNotes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {archivedNotes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6 opacity-50">📦</div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3">No archived notes</h3>
          <p className="text-lg text-gray-600">Notes that expire will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {archivedNotes.map((note) => (
            <ArchivedNoteCard key={note.id} note={note} onRevive={onRevive} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Archive 