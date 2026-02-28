import React from "react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
        Language
      </span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        {LANGUAGES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
