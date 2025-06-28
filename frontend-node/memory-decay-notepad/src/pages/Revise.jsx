import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

const Revise = ({ notes, onRevise }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [answer, setAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)

  const note = notes.find((n) => n.id === Number.parseInt(id))

  if (!note) {
    return (
      <div className="w-full text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Note not found</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  // Simple AI-generated question based on content
  const generateQuestion = (content) => {
    const words = content.split(" ")
    if (words.length > 10) {
      return `What is the main topic discussed in this note?`
    }
    return `Can you summarize the key point from this note?`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (answer.trim().length > 5) {
      // Simple validation
      onRevise(note.id, 30 * 60 * 1000) // Extend by 30 minutes
      setShowResult(true)
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Revise Note</h1>
        <p className="text-lg text-gray-600">Review and answer the question to extend the note's life</p>
      </div>

      <div className="space-y-8">
        {/* Note Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{note.title}</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{note.content}</p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-8">
          <h3 className="text-xl font-medium text-orange-900 mb-4">📝 Summary</h3>
          <p className="text-orange-800 text-lg">
            This note contains important information about {note.title.toLowerCase()}. Regular review helps strengthen
            memory retention.
          </p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-medium text-gray-900 mb-6">❓ Review Question</h3>
          <p className="text-gray-700 mb-8 text-lg">{generateQuestion(note.content)}</p>

          {!showResult ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none text-lg"
                rows={6}
                placeholder="Type your answer here..."
                required
              />
              <div className="flex space-x-6">
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200 text-lg"
                >
                  Submit Answer
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">✅</div>
              <h4 className="text-2xl font-medium text-green-700 mb-3">Great job!</h4>
              <p className="text-green-600 text-lg">Your note has been extended by 30 minutes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Revise 