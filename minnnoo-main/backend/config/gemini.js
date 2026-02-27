// // config/gemini.js
// const { Gemini } = require("gemini-ai"); // or official SDK
// require("dotenv").config();

// const geminiClient = new Gemini({
//   apiKey: process.env.GEMINI_API_KEY, // ✅ your Gemini 3 Pro key
// });

// module.exports = geminiClient;


// // config/gemini.js
// const OpenAI = require("openai");

// const geminiClient = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY, // ✅ your Gemini 3 Pro key here
// });

// module.exports = geminiClient;



const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = genAI;
