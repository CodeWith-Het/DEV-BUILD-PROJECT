const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ FIX: .trim() lagaya taaki .env file mein galti se space ho toh wo hat jaye
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

router.post("/analyze", async (req, res) => {
  const { code, language, prompt: customPrompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Default instruction if user didn't type a custom prompt
    const userInstruction = customPrompt ? customPrompt : "Review this code, find bugs, and suggest improvements.";

    // ✅ NAYA PROMPT: AI ko strictly JSON return karne bol rahe hain
    const finalPrompt = `
You are an expert ${language} developer.
User's Request: "${userInstruction}"

Analyze this code:
\`\`\`${language}
${code || "// No code provided"}
\`\`\`

You MUST respond STRICTLY with a valid JSON object. DO NOT wrap it in markdown blockquotes like \`\`\`json. Just output the raw JSON.
The JSON MUST match this exact structure:
{
  "scores": [
    { "subject": "Quality", "score": <number 0-100> },
    { "subject": "Performance", "score": <number 0-100> },
    { "subject": "Readability", "score": <number 0-100> },
    { "subject": "Security", "score": <number 0-100> }
  ],
  "review": "Your detailed code review in Markdown format (use emojis like ❌, 🔘, ✅, 💡). Use \\n for newlines."
}
`;

    const result = await model.generateContent(finalPrompt);
    let text = result.response.text();

    // ✅ JSON Formatting safeguard (agar AI galti se ```json laga de toh use hata do)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // JSON parse karo aur bhej do
    const parsedData = JSON.parse(text);
    res.json(parsedData);

  } catch (error) {
    console.error("AI Error:", error.message || error);
    res.status(500).json({ 
      error: "AI Analysis failed.", 
      review: "⚠️ Error parsing AI response. Please try again." 
    });
  }
});

module.exports = router;