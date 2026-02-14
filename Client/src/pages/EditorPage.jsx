import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { initSocket } from "../socket";

const EditorPage = () => {
  const socketRef = useRef(null);
  const { roomId } = useParams(); // URL se Room ID li
  const [code, setCode] = useState("// Start coding here...");

  useEffect(() => {
    const init = async () => {
      // 1. Server se connect kiya
      socketRef.current = await initSocket();

      // 2. Error handling
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
      }

      // 3. Room Join kiya
      socketRef.current.emit("join_room", roomId);

      // 4. Server se code receive kiya (Jab koi aur type karega)
      socketRef.current.on("receive_code", (newCode) => {
        if (newCode !== null) {
          setCode(newCode);
        }
      });
    };

    init();

    // Cleanup: Page chhodne par disconnect
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  // ✅ Jab hum type karein, server ko bhejo
  const handleCodeChange = (value) => {
    setCode(value);
    if (socketRef.current) {
      socketRef.current.emit("code_change", {
        roomId,
        code: value,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar (Users & Files) */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Collaborators</h2>
        {/* Yahan baad mein Connected Users ki list dikhayenge */}
        <div className="flex-1 overflow-auto">
          <div className="flex items-center gap-3 bg-gray-700 p-2 rounded-md mb-2">
            <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              You
            </span>
            <span>You</span>
          </div>
        </div>
        <button className="bg-white text-gray-900 font-bold py-2 rounded-md mt-4 hover:bg-gray-200">
          Copy Room ID
        </button>
        <button className="bg-red-500 text-white font-bold py-2 rounded-md mt-2 hover:bg-red-600">
          Leave Room
        </button>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col">
        <Editor
          height="100%"
          theme="vs-dark" // Dark theme VS Code jaisa
          language="javascript" // Language
          value={code}
          onChange={handleCodeChange} // Type karne par function call
          options={{
            fontSize: 16,
            minimap: { enabled: false }, // Side ka chhota map hataya
            contextmenu: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
