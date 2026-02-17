import React, { useState, useEffect } from "react";
import { Code2, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Page load hote hi aur login ke baad user check karega
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    window.location.href = "http://localhost:3001/auth/logout";
  };

  // ✅ Naam ka pehla letter nikalne ke liye logic
  const getInitial = () => {
    if (currentUser?.username)
      return currentUser.username.charAt(0).toUpperCase();
    if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-3 bg-gray-900/90 text-white border-b border-gray-800 backdrop-blur-md">
      {/* Logo Section */}
      <Link
        to="/"
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <Code2 className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-bold tracking-tight">CollabCode</span>
      </Link>

      <div className="flex items-center gap-6">
        {currentUser ? (
          /* ✅ LOGIN KE BAAD: Gemini Style Colorful Avatar */
          <div className="relative group">
            <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 hover:bg-gray-800 rounded-full transition">
              {/* Colorful Avatar Circle with Gradient */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-gray-700">
                {getInitial()}
              </div>

              {/* Display Username */}
              <span className="hidden md:block text-sm font-medium text-gray-200">
                {currentUser.username || currentUser.email.split("@")[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition" />
            </div>

            {/* Dropdown Menu on Hover */}
            <div className="absolute right-0 top-full pt-2 w-48 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden py-1">
                <div className="px-4 py-2 border-b border-gray-700 mb-1">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold truncate">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ❌ LOGIN SE PEHLE: Default Buttons */
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-gray-300 hover:text-white font-medium transition"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-lg shadow-blue-500/20"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
