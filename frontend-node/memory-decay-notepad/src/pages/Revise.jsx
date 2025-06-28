import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { apiService } from "../services/api"

const Revise = ({ notes, fetchNotes }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [answer, setAnswer] = useState("")
  const [aiSummary, setAiSummary] = useState("")
  const [aiQuestions, setAiQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const note = notes.find((n) => n.id === Number.parseInt(id))

  useEffect(() => {
    const fetchAI = async () => {
      if (!note) return
      setLoading(true)
      setError("")
      try {
        const res = await apiService.aiRevision(note.id)
        setAiSummary(res.summary)
        setAiQuestions(res.questions)
      } catch (err) {
        setError(err.message || "Failed to load AI revision")
      } finally {
        setLoading(false)
      }
    }
    fetchAI()
    // eslint-disable-next-line
  }, [note])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await apiService.answerRevisionQuestion(note.id, questionIndex, answer)
      setResult(res)
      setShowResult(true)
      await fetchNotes()
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err.message || "Failed to submit answer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Revise Note</h1>
        <p className="text-lg text-gray-600">Review and answer the AI-generated question to extend the note's life</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-lg text-gray-600">Loading AI revision...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">{error}</div>
      ) : (
        <div className="space-y-8">
          {/* Note Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{note.title}</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">{note.content}</p>
            </div>
          </div>

          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-8">
              <h3 className="text-xl font-medium text-orange-900 mb-4">📝 AI Summary</h3>
              <p className="text-orange-800 text-lg">{aiSummary}</p>
            </div>
          )}

          {/* Question */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-medium text-gray-900 mb-6">❓ AI Review Question</h3>
            <p className="text-gray-700 mb-8 text-lg">{aiQuestions[questionIndex]}</p>

            {!showResult ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none text-lg"
                  rows={6}
                  placeholder="Type your answer here..."
                  required
                  disabled={loading}
                />
                <div className="flex space-x-6">
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200 text-lg"
                    disabled={loading}
                  >
                    {loading ? "Checking..." : "Submit Answer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-lg"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : result && result.correct ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">✅</div>
                <h4 className="text-2xl font-medium text-green-700 mb-3">Great job!</h4>
                <p className="text-green-600 text-lg">{result.message || "Your note has been extended."}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">❌</div>
                <h4 className="text-2xl font-medium text-red-700 mb-3">Try again!</h4>
                <p className="text-red-600 text-lg">{result?.message || "Incorrect answer. Decay time reduced."}</p>
                {result?.feedback && <p className="text-orange-700 mt-2">{result.feedback}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Revise 