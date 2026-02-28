import React, { useMemo, useState } from "react";
import axios from "axios";
import { Bot, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function AIAssistant({ code, language }) {
  const [prompt, setPrompt] = useState("Review this code, find bugs, and suggest improvements.");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(() => Boolean((prompt ?? "").trim()), [prompt]);

  const run = async () => {
    if (!canSend) return;
    setIsLoading(true);
    setResult("");
    try {
      const res = await axios.post("/api/ai/analyze", { code, language, prompt }, { withCredentials: true });
      setResult(res.data?.text || "No response");
    } catch (e) {
      setResult(e?.response?.data?.message || "AI request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] border-l border-gray-800 text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#151B28]">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-white">AI Code Reviewer</span>
        </div>
      </div>

      {/* Chat / Output Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {!result ? (
          <div className="text-sm text-gray-500 text-center mt-10">
            Click "Review Code" to analyze the current file.
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-sm space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg text-[13px] my-2"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-red-400 font-mono text-[12px]" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-2 text-gray-300">{children}</p>,
                ul: ({ children }) => <ul className="space-y-1 my-2 text-gray-300">{children}</ul>,
                li: ({ children }) => <li className="flex items-start gap-2">{children}</li>,
                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#151B28] border-t border-gray-800">
        <button
          onClick={run}
          disabled={!canSend || isLoading}
          className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-50 transition-all"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? "Analyzing Code..." : "Review Code"}
        </button>
      </div>
    </div>
  );
}