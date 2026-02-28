import React, { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

function monacoLanguageId(lang) {
  switch (lang) {
    case "python":
      return "python";
    case "java":
      return "java";
    case "text/x-c++src":
    case "cpp":
      return "cpp";
    case "javascript":
    default:
      return "javascript";
  }
}

// Diff logic taaki sirf naya text server pe jaye (pura code nahi)
function computeOp(prev, next) {
  if (prev === next) return null;
  let start = 0;
  while (
    start < prev.length &&
    start < next.length &&
    prev[start] === next[start]
  )
    start++;
  let endPrev = prev.length;
  let endNext = next.length;
  while (
    endPrev > start &&
    endNext > start &&
    prev[endPrev - 1] === next[endNext - 1]
  ) {
    endPrev--;
    endNext--;
  }
  const deleted = endPrev - start;
  const insertedText = next.slice(start, endNext);
  if (deleted > 0 && insertedText.length > 0) {
    return [
      { type: "delete", pos: start, length: deleted },
      { type: "insert", pos: start, text: insertedText },
    ];
  }
  return deleted > 0
    ? { type: "delete", pos: start, length: deleted }
    : { type: "insert", pos: start, text: insertedText };
}

function applyOp(text, op) {
  if (!op) return text;
  if (Array.isArray(op)) return op.reduce((t, o) => applyOp(t, o), text);
  const pos = Math.max(0, Math.min(op.pos, text.length));
  if (op.type === "insert")
    return text.slice(0, pos) + (op.text || "") + text.slice(pos);
  if (op.type === "delete")
    return text.slice(0, pos) + text.slice(pos + (op.length || 0));
  return text;
}

export default function CodeEditor({
  socketRef,
  roomId,
  language,
  onCodeChange,
  selectedFile,
}) {
  const [code, setCode] = useState("");
  const [version, setVersion] = useState(0);
  const [fileContent, setFileContent] = useState({});
  const editorRef = useRef(null);

  // Ye references loop aur double-typing rokne ke liye hain
  const lastSentTextRef = useRef("");
  const suppressRef = useRef(false);

  const monacoLang = useMemo(() => monacoLanguageId(language), [language]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // Handle file selection - load file content
  useEffect(() => {
    if (selectedFile?.id) {
      const fileId = selectedFile.id;
      // If we have cached content, use it; otherwise use default empty
      const content = fileContent[fileId] ?? selectedFile.content ?? "";
      suppressRef.current = true;
      setCode(content);
      lastSentTextRef.current = content;
      onCodeChange?.(content);
      setTimeout(() => (suppressRef.current = false), 0);
    }
  }, [selectedFile?.id]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const onInit = ({ text, version: v }) => {
      suppressRef.current = true;
      const val = text ?? "";
      setCode(val);
      lastSentTextRef.current = val;
      setVersion(v ?? 0);
      onCodeChange?.(val);
      setTimeout(() => (suppressRef.current = false), 0);
    };

    const onApplied = ({ op, version: v, authorSocketId }) => {
      // ✅ Agar main khud type kar raha hu, toh usko wapas ignore karo
      if (authorSocketId && socket.id && authorSocketId === socket.id) {
        setVersion((prev) => (typeof v === "number" ? v : prev));
        return;
      }

      // Doosre user ka code screen par lagao
      suppressRef.current = true;
      setCode((prev) => {
        const next = applyOp(prev, op);
        lastSentTextRef.current = next;
        onCodeChange?.(next);
        return next;
      });
      setVersion((prev) => (typeof v === "number" ? v : prev));
      setTimeout(() => (suppressRef.current = false), 0);
    };

    socket.on("doc_init", onInit);
    socket.on("ot_applied", onApplied);

    return () => {
      socket.off("doc_init", onInit);
      socket.off("ot_applied", onApplied);
    };
  }, [socketRef, onCodeChange]);

  const handleChange = (value) => {
    const next = value ?? "";

    // Agar text socket se aaya hai, toh emit rok do (infinite loop bachane ke liye)
    if (suppressRef.current) {
      setCode(next);
      onCodeChange?.(next);
      return;
    }

    const prev = lastSentTextRef.current;
    const op = computeOp(prev, next);

    // Apna screen update karo
    setCode(next);
    onCodeChange?.(next);
    lastSentTextRef.current = next;

    // Cache file content locally
    if (selectedFile?.id) {
      setFileContent((prev) => ({
        ...prev,
        [selectedFile.id]: next,
      }));
    }

    // ✅ YEH THA MISSING LOGIC: Doosre users ko bhej do!
    if (socketRef.current && roomId && op) {
      if (Array.isArray(op)) {
        op.forEach((single) =>
          socketRef.current.emit("ot_op", {
            roomId,
            op: single,
            baseVersion: version,
          }),
        );
        setVersion((prevV) => prevV + op.length);
      } else {
        socketRef.current.emit("ot_op", { roomId, op, baseVersion: version });
        setVersion((prevV) => prevV + 1);
      }
    }
  };

  return (
    <div className="w-full h-full bg-[#1E1E1E] flex flex-col border-t border-gray-800/50">
      {/* File Tab Header */}
      {selectedFile && (
        <div className="bg-gray-900/80 border-b border-gray-700 px-4 py-2 flex items-center gap-2 text-sm">
          <span className="text-gray-300">📄</span>
          <span className="text-white font-medium">{selectedFile.name}</span>
          <span className="text-gray-500 text-xs ml-auto">
            {selectedFile.type === "file" && "(Local)"}
          </span>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={monacoLang}
          theme="vs-dark"
          value={code}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 15,
            lineHeight: 24,
            minimap: { enabled: false },
            automaticLayout: true,
            cursorSmoothCaretAnimation: "on",
            padding: { top: 30, bottom: 20 },
            scrollBeyondLastLine: false,
            fontFamily: "'Fira Code', Consolas, monospace",
          }}
        />
      </div>
    </div>
  );
}
