import React, { useState, useEffect } from "react";
import { ArrowRight, Users, Zap, Bot, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  // ✅ 1. Auth Check & Username Autofill
  useEffect(() => {
    const checkUser = async () => {
      // Step A: LocalStorage Check (Email login walon ke liye)
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser) {
        setUsername(localUser.username || localUser.email?.split("@")[0]);
        return;
      }

      // Step B: Server Check (Google/GitHub login walon ke liye)
      try {
        const res = await axios.get("http://localhost:3001/api/user", {
          withCredentials: true,
        });
        if (res.data) {
          setUsername(res.data.username || res.data.email?.split("@")[0]);
        } else {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  // ✅ 2. Generate New Room ID
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("Created a new Room ID! 🎉");
  };

  // ✅ 3. Join Room Logic
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room ID & Username are required!");
      return;
    }
    // Editor page par Username pass karna zaroori hai
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  // ✅ 4. Logout Logic
  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "http://localhost:3001/auth/logout";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center relative overflow-hidden">
      {/* --- Header (Logout Button) --- */}
      <div className="absolute top-5 right-5 z-10">
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-gray-800 hover:bg-red-500/10 hover:text-red-400 border border-gray-700 hover:border-red-500/50 px-4 py-2 rounded-lg transition text-sm font-medium text-gray-400"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="pt-24 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl">
        {/* Badge */}
        <div className="mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-fade-in-up">
          🚀 AI-Powered Real-time Coding
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
          Code Together, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Build Faster.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
          Real-time collaborative code editor with built-in AI analysis. Detect
          bugs, merge conflicts, and optimize code instantly.
        </p>

        {/* --- Main Input Section --- */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
          {/* Input Group */}
          <div className="flex flex-col gap-4">
            {/* Username Input (Editable) */}
            <div className="text-left">
              <label className="text-xs text-gray-400 ml-1 mb-1 block">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter Username"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyUp={handleInputEnter}
              />
            </div>

            {/* Room ID Input */}
            <div className="text-left">
              <label className="text-xs text-gray-400 ml-1 mb-1 block">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Room ID"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyUp={handleInputEnter}
                />
                <button
                  onClick={joinRoom}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition flex items-center gap-2"
                >
                  Join <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          {/* Create Room Button */}
          <button
            onClick={createNewRoom}
            className="w-full py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 border-dashed rounded-xl font-medium transition text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2"
          >
            Generate Unique Room ID
          </button>
        </div>

        {/* Feature Icons */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-gray-500 pb-10">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> Real-time Sync
          </div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" /> AI Assistant
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" /> Multiplayer
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
