import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import {toast} from "react-hot-toast"
import ReactMarkdown from "react-markdown"; // AI ka response sundar dikhane ke liye
// import analyzeCode from "../services/aiService"; // Aapka AI logic file

const AIAssistant = ({ code, language }) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!code) return toast.error("Bhai, pehle kuch code toh likho!");

    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        throw new Error("Server ne response nahi diya");
      }

      const data = await res.json();
      setResponse(data.review || data.text);
    } catch (err) {
      console.error(err);
      setResponse("Kuch gadbad ho gayi, server check karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-gray-300 p-4">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h2 className="font-bold text-lg">AI Code Reviewer</h2>
      </div>
      {/* Response Area */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar transition-all duration-300">
        {!response && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
            <div className="p-4 bg-gray-800/50 rounded-full mb-3">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-sm font-medium">Ready to review your code</p>
            <p className="text-[11px] mt-1">
              Select a file and click the button below
            </p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-sm leading-relaxed animate-in fade-in duration-500">
            {/* Agar response hai toh Markdown dikhao */}
            {response && <ReactMarkdown>{response}</ReactMarkdown>}

            {/* Loading state ke waqt ek chota placeholder skeleton bhi dikha sakte ho */}
            {loading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <div className="pt-4 border-t border-gray-800">
        <button
          onClick={handleAnalyze}
          disabled={loading || !code}
          className={`
      flex items-center justify-center gap-3 w-full py-3 px-4 
      font-bold rounded-xl transition-all duration-200 
      ${
        loading
          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg active:scale-95"
      }
    `}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="tracking-wide">Analyzing Code...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span className="tracking-wide">Review Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
