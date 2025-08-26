import { Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext/AuthContext";

export function NavBar() {
  const { user, logout } = useAuthContext();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 bg-[#121212] text-white border-b border-[#27272a]">
      <div className="flex justify-between items-center">
        {user ? (
          <>
            <Link to="/" className="text-2xl font-bold">
              Home
            </Link>
            <div className="flex justify-end items-center gap-4">
              <Link
                to="/profile"
                className="py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
              >
                Profile
              </Link>
              <button
                className="py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                onClick={() => logout()}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-300">
              Login
            </Link>
            <Link to="/register" className="hover:text-gray-300">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
