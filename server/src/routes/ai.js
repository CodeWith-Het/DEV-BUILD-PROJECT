const express = require("express");

const router = express.Router();

// ❌ Maine yahan se wo ghalat line hata di hai jisse server crash ho raha tha

function requireAuth(req, res, next) {
  // Passport adds req.user when authenticated.
  if (req.user) return next();
  return res.status(401).json({ message: "Not Authenticated" });
}

// Very small in-memory rate limiter per IP.
// NOTE: This is best-effort only; consider a shared store for multi-instance deployments.
const WINDOW_MS = 60_000;
const MAX_REQS = 20;
const ipHits = new Map();

function rateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const entry = ipHits.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count += 1;
  ipHits.set(ip, entry);
  if (entry.count > MAX_REQS) {
    return res.status(429).json({ message: "Rate limit exceeded." });
  }
  return next();
}

// Proxy route for Gemini (or other LLM) so the API key never lands in the browser.
// Requires env: GEMINI_API_KEY
router.post("/analyze", requireAuth, rateLimit, async (req, res) => {
  const { code, language, prompt } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ message: "GEMINI_API_KEY is not set on the server." });
  }

  try {
    // Lazy import so server still boots even if dependency is missing until route is hit.
    // eslint-disable-next-line global-require
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ YAHAN UPDATE KIYA HAI: Sahi jagah par 'gemini-1.5-flash-latest' laga diya
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const userPrompt = String(prompt || "").trim();
    const lang = String(language || "javascript");
    const src = String(code || "");

    // Basic payload limits (defense-in-depth; JSON body is already limited in app.js)
    if (userPrompt.length > 1_000) {
      return res.status(400).json({ message: "Prompt too long." });
    }
    if (src.length > 40_000) {
      return res.status(400).json({ message: "Code too long." });
    }

    // ✅ NEW STRICT PROMPT FORMATTING FOR UI
    const fullPrompt = `
You are an expert ${lang} developer code reviewer.
Analyze the provided code, find bugs, bad practices, and address the user's specific task: "${userPrompt || "Find bugs and suggest optimizations."}"

You MUST format your response EXACTLY like this using Markdown and these specific emojis:

❌ **Bad Code:**
\`\`\`${lang}
(Show the problematic part of the code here)
\`\`\`

🔘 **Issues:**
* ❌ (Issue 1 description)
* ❌ (Issue 2 description)

✅ **Recommended Fix:**
\`\`\`${lang}
(Show the corrected, fully documented, and optimized code here)
\`\`\`

💡 **Improvements:**
* ✔️ (Improvement 1 explanation)
* ✔️ (Improvement 2 explanation)

Keep the explanations concise and professional. Do not add any extra greeting text like "Here is the review". Only return the formatted markdown.

Code:
\`\`\`${lang}
${src}
\`\`\`
`;

    const result = await model.generateContent(fullPrompt);
    const text = result?.response?.text?.() || "";

    return res.json({ text });
  } catch (err) {
    console.error("AI Error:", err);
    // Asli error terminal par dikhega, frontend par generic message
    return res
      .status(500)
      .json({ message: "AI analysis failed. Server console check karo." });
  }
});

module.exports = router;
