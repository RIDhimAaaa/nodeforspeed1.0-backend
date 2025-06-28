import { Link, useLocation } from "react-router-dom"

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/new", label: "New Note", icon: "➕" },
    { path: "/archive", label: "Archive", icon: "📦" },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm w-full">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🧠</span>
            <h1 className="text-2xl font-semibold text-gray-800">Memory Decay Notepad</h1>
          </div>

          <div className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 