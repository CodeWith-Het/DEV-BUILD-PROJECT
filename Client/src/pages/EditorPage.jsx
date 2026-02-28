import React, { useState, useEffect, useRef } from "react";
import {
  useParams,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import { LogOut, Copy, Hash } from "lucide-react";
import { initSocket } from "../socket";

import CodeEditor from "../components/CodeEditor";
import LanguageSelector from "../components/LanguageSelector";
import AIAssistant from "../components/AIAssistant";
import FileExplorer from "../components/FileExplorer";

const EditorPage = () => {
  const socketRef = useRef(null);
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username =
    location.state?.username ||
    storedUser?.username ||
    storedUser?.email?.split("@")[0];

  useEffect(() => {
    const init = async () => {
      if (!username) {
        toast.error("Username is required to join");
        navigate("/");
        return;
      }

      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors() {
        toast.error("Socket connection failed.");
        navigate("/");
      }

      // ✅ Backend Join
      socketRef.current.emit("join", { roomId, username });

      // ✅ Listen for Events
      socketRef.current.on("joined", ({ clients, username: joinedUser }) => {
        if (joinedUser !== username) {
          toast.success(`${joinedUser} joined.`);
        }
        setClients(clients);
      });

      socketRef.current.on("language_changed", ({ language }) => {
        setLanguage(language);
      });

      socketRef.current.on(
        "disconnected",
        ({ socketId, username: leftUser }) => {
          toast.error(`${leftUser} left the room.`);
          setClients((prev) => prev.filter((c) => c.socketId !== socketId));
        },
      );

      setIsSocketReady(true);
    };
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
        socketRef.current.off("language_changed");
      }
    };
  }, [roomId, navigate, username]);

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate("/");
  };

  const onLanguageChange = (lang) => {
    setLanguage(lang);
    socketRef.current?.emit("language_change", { roomId, language: lang });
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="mainWrapper flex h-screen pt-[70px] bg-gray-900 text-white overflow-hidden">
      {/* Sidebar Section - Room Info */}
      <div className="aside w-64 bg-gray-800 flex flex-col border-r border-gray-700 shadow-xl z-10">
        <div className="asideInner flex-1 p-4 overflow-y-auto">
          <div className="logo mb-6 pb-4 border-b border-gray-700 flex items-center gap-2">
            <Hash className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold tracking-tight">CollabCode</span>
          </div>

          <div className="mb-5">
            <LanguageSelector value={language} onChange={onLanguageChange} />
          </div>

          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-1">
            Connected Users
          </h3>

          <div className="clientsList flex flex-col gap-2">
            {clients.map((client) => (
              <div
                key={client.socketId}
                className="flex items-center gap-3 p-2.5 bg-gray-900/50 rounded-xl border border-gray-700"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center text-[12px] font-bold border border-white/10 shadow-lg">
                  {client.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium truncate flex-1">
                  {client.username} {client.username === username ? "(You)" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-900/80 border-t border-gray-700 flex flex-col gap-2">
          <button
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold rounded-md shadow-md hover:scale-105 transform transition-all duration-150"
            onClick={copyRoomId}
          >
            <Copy className="w-4 h-4 text-white" /> Copy Room ID
          </button>
          <button
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-transparent text-red-400 border border-red-500/20 font-semibold rounded-md shadow-sm hover:bg-red-600 hover:text-white transform transition-all duration-150 hover:scale-105"
            onClick={leaveRoom}
          >
            <LogOut className="w-4 h-4" /> Leave Room
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* File Explorer - Left Panel */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          {isSocketReady ? <FileExplorer socketRef={socketRef} roomId={roomId} onFileSelect={setSelectedFile} /> : null}
        </div>

        {/* Editor - Center Panel */}
        <div className="flex-1 flex flex-col bg-[#1E1E1E]">
          {isSocketReady ? (
            <CodeEditor socketRef={socketRef} roomId={roomId} language={language} onCodeChange={setCode} selectedFile={selectedFile} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">Initializing Connection...</div>
          )}
        </div>

        {/* ✅ AI Assistant - Right Panel */}
        <div className="w-[450px] bg-[#1E1E1E] flex flex-col border-l border-gray-800">
          <AIAssistant code={code} language={language} />
        </div>

      </div>
    </div>
  );
};

export default EditorPage;