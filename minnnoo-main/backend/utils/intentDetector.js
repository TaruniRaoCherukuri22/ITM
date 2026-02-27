// const detectIntent = require("../utils/intentDetector");
// const Vacancy = require("../models/Vacancy");
// const Application = require("../models/Application");

// exports.askQuestion = async (req, res) => {
//   const { userId, message } = req.body;

//   const { intent, confidence } = await detectIntent(message);

//   if (confidence < 0.6) {
//     return res.json({
//       reply: "I didn’t fully understand. Try asking about jobs, ATS score, or applications."
//     });
//   }

//   switch (intent) {

//     case "get_vacancies": {
//       const vacancies = await Vacancy.find();
//       return res.json({
//         reply: `There are ${vacancies.length} open positions.`,
//         data: vacancies
//       });
//     }

//     case "get_ats_score": {
//       const app = await Application.findOne({ userId });
//       return res.json({
//         reply: app
//           ? `Your ATS score is ${app.atsScore}/100`
//           : "You haven't applied yet."
//       });
//     }

//     case "match_jobs": {
//       const apps = await Application.find({ userId })
//         .populate("vacancyId");

//       return res.json({
//         reply: "These jobs match your profile:",
//         data: apps.map(a => ({
//           job: a.vacancyId.title,
//           atsScore: a.atsScore
//         }))
//       });
//     }

//     case "application_status": {
//       const apps = await Application.find({ userId })
//         .populate("vacancyId");

//       return res.json({
//         reply: "Your application statuses:",
//         data: apps.map(a => ({
//           job: a.vacancyId.title,
//           status: a.status
//         }))
//       });
//     }

//     default:
//       return res.json({
//         reply: "I can help with jobs, ATS score, and applications."
//       });
//   }
// };


// module.exports = detectIntent;



const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function detectIntent(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
You are an intent classifier for an ATS system.

Return ONLY raw JSON.
NO markdown. NO backticks.

Format:
{
  "intent": "get_vacancies | get_ats_score | match_jobs | application_status",
  "confidence": number between 0 and 1
}

User message:
"${message}"
`;

  const result = await model.generateContent(prompt);

  let text = result.response.text().trim();
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  return JSON.parse(text);
}

module.exports = detectIntent;