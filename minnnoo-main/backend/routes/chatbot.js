// // backend/routes/chatbot.js
// const { Server } = require("socket.io");
// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const { textToVector, cosineSimilarity } = require("../utils/atsScoring");

// module.exports = function attachChatbot(server) {
//   const io = new Server(server, { cors: { origin: "*" } });

//   io.on("connection", (socket) => {
//     console.log("Client connected:", socket.id);

//     socket.on("user_query", async ({ userId, query }) => {
//       if (!userId || !query) {
//         socket.emit("bot_response", { answer: "Please provide a valid query." });
//         return;
//       }

//       try {
//         const user = await User.findById(userId);
//         const vacancies = await Vacancy.find();

//         const queryVector = textToVector(query);

//         const intents = [
//           { id: "matched_jobs", question: "Which jobs match me best?" },
//           { id: "missing_skills", question: "What skills am I missing?" },
//           { id: "profile_strength", question: "What is my profile strength?" },
//         ];

//         let bestIntent = { similarity: 0, id: null };
//         intents.forEach((intent) => {
//           const sim = cosineSimilarity(queryVector, textToVector(intent.question));
//           if (sim > bestIntent.similarity) bestIntent = { similarity: sim, id: intent.id };
//         });

//         let targetJob = vacancies.find((v) => query.toLowerCase().includes(v.title.toLowerCase()));

//         let answer = "Sorry, I couldn't understand your question.";
//         if (bestIntent.similarity < 0.15) {
//           socket.emit("bot_response", { answer });
//           return;
//         }

//         switch (bestIntent.id) {
//           case "matched_jobs":
//             const matchedJobs = vacancies
//               .filter((v) =>
//                 v.atsScores?.some(
//                   (s) => s.userId.toString() === userId && s.score >= 32
//                 )
//               )
//               .map((v) => v.title);

//             answer = matchedJobs.length
//               ? `You have ${matchedJobs.length} matched jobs: ${matchedJobs.join(", ")}`
//               : "No matched jobs yet.";
//             break;

//           case "missing_skills":
//             if (targetJob) {
//               const aiScore = targetJob.aiScores?.find(
//                 (s) => s.userId.toString() === userId
//               );
//               answer = aiScore?.missingSkills?.length
//                 ? `For "${targetJob.title}", missing skills: ${aiScore.missingSkills.join(", ")}`
//                 : `No missing skills for "${targetJob.title}".`;
//             } else {
//               let missingSkills = [];
//               vacancies.forEach((v) => {
//                 const aiScore = v.aiScores?.find(
//                   (s) => s.userId.toString() === userId
//                 );
//                 if (aiScore?.missingSkills?.length) missingSkills.push(...aiScore.missingSkills);
//               });
//               missingSkills = [...new Set(missingSkills)];
//               answer = missingSkills.length
//                 ? `Across your jobs, missing skills: ${missingSkills.join(", ")}`
//                 : "No missing skills across your jobs.";
//             }
//             break;

//           case "profile_strength":
//             const matchedCount = vacancies.filter((v) =>
//               v.atsScores?.some(
//                 (s) => s.userId.toString() === userId && s.score >= 32
//               )
//             ).length;
//             const totalJobs = vacancies.length || 1;
//             answer = `Your profile strength is ${Math.round((matchedCount / totalJobs) * 100)}%.`;
//             break;
//         }

//         socket.emit("bot_response", { answer });
//       } catch (err) {
//         console.error("Chatbot error:", err);
//         socket.emit("bot_response", { answer: "Something went wrong." });
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("Client disconnected:", socket.id);
//     });
//   });
// };



const express = require("express");
const router = express.Router();
const { askQuestion } = require("../controllers/chatbotController");

// Employee chatbot (dynamic questions)
router.post("/ask", askQuestion);

module.exports = router;
