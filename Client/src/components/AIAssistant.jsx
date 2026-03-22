import React, { useState } from "react";
import { Sparkles, Loader2, Send, MessageSquare, Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ✅ Syntax Highlighting Imports
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// Agar Next.js me import error aaye, toh 'esm' ki jagah 'cjs' use karna:
// import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const AIAssistant = ({ code, language }) => {
  const [response, setResponse] = useState("");
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");

  const handleAnalyze = async (customPrompt = null) => {
    if (!code) return toast.error("Bhai, pehle kuch code toh likho!");

    const finalPrompt =
      customPrompt ||
      userPrompt ||
      "Review this code and give me quality metrics.";

    setLoading(true);
    setScores(null);
    setResponse("");

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, prompt: finalPrompt }),
      });

      if (!res.ok) {
        throw new Error("Server ne response nahi diya");
      }

      const data = await res.json();

      setResponse(data.review || data.text);
      if (data.scores) setScores(data.scores);

      setUserPrompt("");
    } catch (err) {
      console.error(err);
      toast.error("Kuch gadbad ho gayi, server check karo.");
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
              <MessageSquare className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-sm font-medium">Ask AI about your code</p>
            <p className="text-[11px] mt-1 text-center px-4">
              Type a prompt below or use the quick actions to get a review and
              code metrics.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* RADAR CHART */}
            {scores && (
              <div className="mb-6 p-4 bg-[#151B28] border border-gray-800 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Quality Metrics
                  </h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      data={scores}
                    >
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#8B5CF6", fontWeight: "bold" }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ✅ FIXED MARKDOWN RENDERER */}
            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              {response && (
                <ReactMarkdown
                  components={{
                    // 'node' ko destructure kar rahe hain taaki vo neeche spread (...props) me na chala jayein
                    // 'inline' ka use karke inline code vs code block rendering sahi kar rahe hain
                    code({ node, inline, className, children, ...props }) {
                      // `node` ko intentionally ignore kar rahe hain (sirf destructure kiya hai taaki spread me na jaye)
                      void node;
                      const match = /language-(\w+)/.exec(className || "");
                      const codeText = String(children).replace(/\n$/, "");

                      // Code blocks (inline === false) ko block style me render karein
                      if (!inline) {
                        return match ? (
                          <div className="rounded-md overflow-hidden my-4 border border-gray-700 shadow-md">
                            <div className="bg-gray-800 px-4 py-1 text-xs text-gray-400 border-b border-gray-700 uppercase tracking-wider">
                              {match[1]}
                            </div>
                            <SyntaxHighlighter
                              {...props}
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: "1rem",
                                backgroundColor: "#0D1117",
                                fontSize: "13px",
                              }}
                            >
                              {codeText}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <pre className="my-4 overflow-x-auto rounded-md border border-gray-700 bg-[#0D1117] p-4 text-[13px]">
                            <code
                              {...props}
                              className={`font-mono ${className || ""}`}
                            >
                              {codeText}
                            </code>
                          </pre>
                        );
                      }

                      // Inline code
                      return (
                        <code
                          {...props}
                          className={`bg-gray-800 text-purple-400 px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-gray-700 ${
                            className || ""
                          }`}
                        >
                          {codeText}
                        </code>
                      );
                    },
                  }}
                >
                  {response}
                </ReactMarkdown>
              )}
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-3 animate-pulse mt-4">
                <div className="h-32 bg-gray-800 rounded-xl w-full mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Prompt Control Panel */}
      <div className="pt-3 border-t border-gray-800 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() =>
              handleAnalyze(
                "Analyze this code and give me quality metrics and a review.",
              )
            }
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full whitespace-nowrap transition"
          >
            📊 Analyze Metrics
          </button>
          <button
            onClick={() =>
              handleAnalyze("Find bugs and provide a fixed version")
            }
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full whitespace-nowrap transition"
          >
            🐛 Find Bugs
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#0B0F1A] rounded-xl border border-gray-700 p-1 focus-within:border-indigo-500/50 transition-colors">
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && userPrompt && handleAnalyze()
            }
            placeholder="Ask AI (e.g. Optimize this)..."
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-white placeholder-gray-600"
            disabled={loading}
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !code || (!userPrompt && !response)}
            className={`p-2.5 rounded-lg transition-all flex items-center justify-center ${
              loading || (!userPrompt && !response)
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 shadow-md"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
