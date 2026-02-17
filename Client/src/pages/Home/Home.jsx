import React, { useState, useEffect } from "react";
import { ArrowRight, Users, Zap, Bot, LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 1. Auth Check & Persistence
  useEffect(() => {
    const checkUser = async () => {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser) {
        setUsername(localUser.username || localUser.email?.split("@")[0]);
        return;
      }

      try {
        const res = await axios.get("http://localhost:3001/api/user", {
          withCredentials: true,
        });
        if (res.data) {
          // Sync server data with localStorage for persistence
          localStorage.setItem("user", JSON.stringify(res.data));
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

  // ✅ 2. Generate Unique Room ID
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("New Room ID generated! 📋");
  };

  // ✅ 3. Join Room with UX Feedback
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Please provide both Room ID and Username");
      return;
    }

    setIsLoading(true);
    // Passing data via location state for the EditorPage
    setTimeout(() => {
      navigate(`/editor/${roomId}`, {
        state: { username },
      });
    }, 500);
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") joinRoom();
  };

  // ✅ 4. Clean Logout Logic
  const logout = () => {
    localStorage.removeItem("user");
    toast.loading("Logging out...");
    window.location.href = "http://localhost:3001/auth/logout";
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col items-center relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full opacity-50"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full opacity-50"></div>

      {/* Logout Header */}
      <div className="absolute top-6 right-8 z-20">
        <button
          onClick={logout}
          className="group flex items-center gap-2 bg-white/5 hover:bg-red-500/20 px-5 py-2.5 rounded-full border border-white/10 hover:border-red-500/30 transition-all duration-300"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
          <span className="text-sm font-semibold text-gray-400 group-hover:text-red-400">
            Exit Session
          </span>
        </button>
      </div>

      <div className="mt-32 flex flex-col items-center text-center px-6 max-w-5xl z-10">
        {/* Animated Badge */}
        <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Collab Editor
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
          Code in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
            Real-Time.
          </span>
          <br /> Ship as a Team.
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 font-medium leading-relaxed">
          The ultimate workspace for remote developers. Experience seamless
          sync, AI debugging, and multiplayer coding in one secure environment.
        </p>

        {/* --- Main Control Panel --- */}
        <div className="w-full max-w-lg bg-[#151B28]/80 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="space-y-6">
            <div className="text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 mb-2 block">
                Developer Alias
              </label>
              <input
                type="text"
                className="w-full bg-[#0B0F1A] border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                placeholder="Your name or handle..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyUp={handleInputEnter}
              />
            </div>

            <div className="text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 mb-2 block">
                Session Gateway (Room ID)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  className="flex-1 bg-[#0B0F1A] border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-mono text-sm"
                  placeholder="Paste invitation code..."
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyUp={handleInputEnter}
                />
                <button
                  onClick={joinRoom}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? "Connecting..." : "Enter"}{" "}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-[#151B28] text-gray-600 font-black uppercase tracking-widest">
                New Session?
              </span>
            </div>
          </div>

          <button
            onClick={createNewRoom}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-2xl font-bold transition-all text-blue-400 flex items-center justify-center gap-2 group"
          >
            Create Private Workspace
          </button>
        </div>

        {/* Tech Indicators */}
        <div className="mt-20 grid grid-cols-3 gap-12 text-gray-600">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5">
              <Zap className="w-6 h-6 text-yellow-500/80" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              Sync Mode: Active
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5">
              <Bot className="w-6 h-6 text-purple-500/80" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              AI Core: Online
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5">
              <Users className="w-6 h-6 text-green-500/80" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              Multiplayer: Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
