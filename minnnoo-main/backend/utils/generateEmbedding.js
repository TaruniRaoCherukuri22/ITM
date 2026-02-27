const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text) {
  if (!text || !text.trim()) return [];

  const model = genAI.getGenerativeModel({
    model: "text-embedding-004"
  });

  const result = await model.embedContent(text);
  return result.embedding.values; // Array<number>
}

module.exports = generateEmbedding;
