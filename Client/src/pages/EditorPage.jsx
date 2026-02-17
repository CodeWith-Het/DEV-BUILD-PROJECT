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

const EditorPage = () => {
  const socketRef = useRef(null);
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);

  // ✅ FIXED: Username priority logic (Location State -> LocalStorage)
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username =
    location.state?.username ||
    storedUser?.username ||
    storedUser?.email?.split("@")[0];

  useEffect(() => {
    const init = async () => {
      // Agar username bilkul nahi mil raha, toh redirect karo
      if (!username) {
        toast.error("Username is required to join");
        navigate("/");
        return;
      }

      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        navigate("/");
      }

      // ✅ Backend ko 'join' event bhejo (Ab username kabhi undefined nahi hoga)
      socketRef.current.emit("join", {
        roomId,
        username,
      });

      socketRef.current.on(
        "joined",
        ({ clients, username: joinedUser, socketId }) => {
          if (joinedUser !== username) {
            toast.success(`${joinedUser} joined the room.`);
          }
          setClients(clients);
        },
      );

      socketRef.current.on(
        "disconnected",
        ({ socketId, username: leftUser }) => {
          toast.error(`${leftUser} left the room.`);
          setClients((prev) => {
            return prev.filter((client) => client.socketId !== socketId);
          });
        },
      );
    };
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
      }
    };
  }, [roomId, navigate, username]); // Dependencies updated

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard!");
    } catch (err) {
      toast.error("Could not copy Room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="mainWrapper flex h-screen bg-gray-900 text-white">
      <div className="aside w-64 bg-gray-800 flex flex-col border-r border-gray-700 shadow-xl">
        <div className="asideInner flex-1 p-4 overflow-y-auto">
          <div className="logo mb-6 pb-4 border-b border-gray-700 flex items-center gap-2">
            <Hash className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold tracking-tight">CollabCode</span>
          </div>

          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Connected Users
          </h3>

          <div className="clientsList flex flex-col gap-3">
            {clients.map((client) => (
              <div
                key={client.socketId}
                className="flex items-center gap-3 p-2.5 bg-gray-900/50 rounded-xl border border-gray-700 transition hover:bg-gray-700"
              >
                {/* Gemini Style Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center text-white font-bold border border-gray-600 shadow-lg">
                  {client.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium truncate flex-1">
                  {client.username}{" "}
                  {client.username === username ? "(You)" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-900/80 border-t border-gray-700 flex flex-col gap-2">
          <button
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition active:scale-95"
            onClick={copyRoomId}
          >
            <Copy className="w-4 h-4" /> Copy Room ID
          </button>
          <button
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600/10 text-red-500 border border-red-500/20 font-bold rounded-lg hover:bg-red-600 hover:text-white transition active:scale-95"
            onClick={leaveRoom}
          >
            <LogOut className="w-4 h-4" /> Leave Room
          </button>
        </div>
      </div>

      <div className="editorWrap flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-gray-500 font-medium tracking-wide">
            Initializing Editor...
          </h2>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
