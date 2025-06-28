import { useState } from "react"
import { useNavigate } from "react-router-dom"

const NewNote = ({ onAddNote }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    decayTime: 5 * 60 * 1000, // 5 minutes default
  })

  const decayOptions = [
    { label: "5 minutes", value: 5 * 60 * 1000 },
    { label: "10 minutes", value: 10 * 60 * 1000 },
    { label: "30 minutes", value: 30 * 60 * 1000 },
    { label: "1 hour", value: 60 * 60 * 1000 },
    { label: "1 day", value: 24 * 60 * 60 * 1000 },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title.trim() && formData.content.trim()) {
      onAddNote(formData)
      navigate("/dashboard")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "decayTime" ? Number.parseInt(value) : value,
    }))
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Create New Note</h1>
        <p className="text-lg text-gray-600">Add a new note with a decay timer</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-3">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-lg"
              placeholder="Enter note title..."
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-base font-medium text-gray-700 mb-3">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none text-lg"
              placeholder="Enter your note content..."
              required
            />
          </div>

          <div>
            <label htmlFor="decayTime" className="block text-base font-medium text-gray-700 mb-3">
              Decay Timer
            </label>
            <select
              id="decayTime"
              name="decayTime"
              value={formData.decayTime}
              onChange={handleChange}
              className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-lg"
            >
              {decayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-6 pt-6">
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 px-8 rounded-lg font-medium transition-colors duration-200 text-lg"
            >
              Create Note
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
      </div>
    </div>
  )
}

export default NewNote 