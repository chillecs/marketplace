import { useAuthContext } from '../AuthContext/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Home() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-[#18181b] rounded-lg shadow-xl p-8 border border-[#27272a]">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hello World! 👋
          </h1>
          <p className="text-[#a1a1aa] mb-6">
            Welcome to Marketplace
          </p>
          {user && (
            <div className="mb-6">
              <p className="text-white mb-2">
                Logged in as: <span className="text-[#8b5cf6]">{user.email}</span>
              </p>
              {user.firstName && (
                <p className="text-[#a1a1aa]">
                  {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
