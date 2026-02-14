import React from 'react';
import { ArrowRight, Users, Zap, Bot } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="bg-gray-900 text-white min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-4">
      
      {/* Badge */}
      <div className="mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
        🚀 AI-Powered Real-time Coding
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
        Code Together, <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Build Faster.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
        Real-time collaborative code editor with built-in AI analysis. 
        Detect bugs, merge conflicts, and optimize code instantly with Gemini AI.
      </p>

      {/* Action Buttons & Inputs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <div className="flex-1 flex gap-2 p-1.5 bg-gray-800 rounded-xl border border-gray-700">
          <input 
            type="text" 
            placeholder="Enter Room ID..." 
            className="flex-1 bg-transparent px-4 text-white outline-none placeholder:text-gray-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
            Join <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <button className="px-6 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-medium transition">
          Create New Room
        </button>
      </div>

      {/* Feature Icons (Small) */}
      <div className="mt-16 flex gap-8 text-gray-500">
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
  );
};

export default HeroSection;