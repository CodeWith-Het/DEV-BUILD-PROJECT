import React, { useState, useEffect } from "react";
import { Code2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Page load hote hi check karo ki user login hai ya nahi
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  // ✅ LOGOUT LOGIC: Jo Navbar ko pehle jaisa bana dega
  const handleLogout = () => {
    // 1. LocalStorage saaf karo taaki session khatam ho jaye
    localStorage.removeItem("user");

    // 2. State ko null karo (Isse buttons turant wapas aa jayenge)
    setCurrentUser(null);

    // 3. Backend session clear karne ke liye redirect karo
    window.location.href = "http://localhost:3001/auth/logout";
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-gray-900 text-white border-b border-gray-800 backdrop-blur-sm bg-opacity-90">
      {/* Logo Section */}
      <Link
        to="/"
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
      >
        <Code2 className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-bold tracking-wide">CollabCode</span>
      </Link>

      <div className="flex items-center gap-4">
        {currentUser ? (
          /* ✅ USER LOGIN HAI: Name aur Avatar dikhao */
          <div className="flex items-center gap-4 bg-gray-800/50 py-1.5 pl-4 pr-1.5 rounded-full border border-gray-700">
            <span className="text-sm font-medium text-gray-300">
              {currentUser.username || currentUser.email?.split("@")[0]}
            </span>

            {/* Avatar Circle Wrapper */}
            <div className="relative group">
              {/* Circle Avatar */}
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-transform active:scale-95">
                {currentUser.username?.charAt(0).toUpperCase() ||
                  currentUser.email?.charAt(0).toUpperCase()}
              </div>

              {/* ✅ Dropdown Menu (Fix: Gap issue resolved using top-full and pt-2) */}
              <div className="absolute right-0 top-full pt-2 w-32 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ❌ LOGOUT YA NO LOGIN: Purane buttons dikhao */
          <>
            <button
              onClick={() => navigate("/login")}
              className="text-gray-300 hover:text-white font-medium transition"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
