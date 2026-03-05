const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ FIX 1: .trim() lagaya taaki .env file mein galti se space ho toh wo hat jaye
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

router.post("/analyze", async (req, res) => {
  const { code, language } = req.body;

  try {
    // ✅ FIX 2: Latest aur sabse fast model use kiya hai jo abhi active hai
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert ${language} developer code reviewer.
Analyze the provided code, find bugs, bad practices, and address them.

You MUST format your response EXACTLY like this using Markdown and these specific emojis:

❌ **Bad Code:**
\`\`\`${language}
(Show the problematic part of the code here)
\`\`\`

🔘 **Issues:**
* ❌ (Issue 1 description)
* ❌ (Issue 2 description)

✅ **Recommended Fix:**
\`\`\`${language}
(Show the corrected, fully documented, and optimized code here)
\`\`\`

💡 **Improvements:**
* ✔️ (Improvement 1 explanation)
* ✔️ (Improvement 2 explanation)

Keep explanations concise.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ review: text });
  } catch (error) {
    console.error("AI Error:", error.message || error);
    res
      .status(500)
      .json({ error: "AI Analysis failed. Check server console." });
  }
});

module.exports = router;
