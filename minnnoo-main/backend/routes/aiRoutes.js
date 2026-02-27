



// const express = require("express");
// const router = express.Router();
// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");

// /* ---------- GEMINI INIT ---------- */
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
//   generationConfig: {
//     responseMimeType: "application/json",
//     temperature: 0.2
//   }
// });




// /* ======================================================
//    🔔 DASHBOARD – FETCH HIGH MATCHING JOBS
// ====================================================== */
// router.get("/dashboard-matches/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const vacancies = await Vacancy.find({
//       aiScores: {
//         $elemMatch: {
//           userId,
//           score: { $gte: 70 }
//         }
//       }
//     }).select("title aiScores");

//     const matches = vacancies.map(v => {
//       const scoreObj = v.aiScores.find(
//         s => s.userId.toString() === userId
//       );

//       return {
//         vacancyId: v._id,
//         title: v.title,
//         score: scoreObj?.score || 0
//       };
//     });

//     res.json({
//       count: matches.length,
//       matches
//     });
//   } catch (err) {
//     console.error("Dashboard match error:", err);
//     res.status(500).json({ message: "Failed to fetch dashboard matches" });
//   }
// });

// const ResumeScore = require("../models/ResumeScore");

// router.get("/user-scores/:userId", async (req, res) => {
//   try {
//     const scores = await ResumeScore.find({ userId: req.params.userId });
//     res.json(scores);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch scores" });
//   }
// });

// /* ======================================================
//    🤖 MATCH SCORE API
// ====================================================== */
// router.post("/match-score", async (req, res) => {
//   try {
//     const { userId, vacancyId } = req.body;

//     const user = await User.findById(userId);
//     const vacancy = await Vacancy.findById(vacancyId);

//     if (!user?.resume) {
//       return res.status(400).json({ message: "Resume not found" });
//     }

//     if (!vacancy) {
//       return res.status(400).json({ message: "Vacancy not found" });
//     }

//     /* ---------- READ RESUME ---------- */
//     const resumePath = path.join(__dirname, "../", user.resume);
//     const buffer = fs.readFileSync(resumePath);
//     const pdfData = await pdfParse(buffer);

//     const resumeText = pdfData.text
//       .replace(/•/g, "-")
//       .replace(/[—–]/g, "-")
//       .replace(/\s+/g, " ")
//       .trim()
//       .slice(0, 3500);

//     /* ---------- JOB DATA ---------- */
//     const jobSkills =
//       Array.isArray(vacancy.skills) && vacancy.skills.length > 0
//         ? vacancy.skills.join(", ")
//         : "";

//     const jobDescription = vacancy.description || "";

//     const combinedJobText = `
// Job Skills:
// ${jobSkills || "Not explicitly listed"}

// Job Description:
// ${jobDescription || "Not provided"}
// `;

//     /* ---------- PROMPT ---------- */
//     const prompt = `
// You are an Applicant Tracking System (ATS).

// Compare Resume SKILLS + PROJECTS with Job Skills AND Job Description.
// Extract missing skills from JD if not explicitly listed.
// Return realistic ATS score (0–100).

// Return ONLY valid JSON:
// {
//   "score": number,
//   "matchedSkills": [],
//   "missingSkills": [],
//   "projectsMatched": [],
//   "summary": ""
// }

// JOB:
// ${combinedJobText}

// RESUME:
// ${resumeText}
// `;

//     /* ---------- GEMINI ---------- */
//     const result = await model.generateContent(prompt);
//     const rawText = result.response.text();

//     console.log("🔵 Gemini RAW RESPONSE:\n", rawText);

//     let aiResult;
//     try {
//       aiResult = JSON.parse(rawText);
//     } catch {
//       aiResult = {
//         score: 0,
//         matchedSkills: [],
//         missingSkills: [],
//         projectsMatched: [],
//         summary: "AI response could not be parsed"
//       };
//     }

//     /* ======================================================
//        🔥 SAVE / UPDATE AI SCORE IN VACANCY
//     ====================================================== */
//     if (!vacancy.aiScores) vacancy.aiScores = [];

//     const existingIndex = vacancy.aiScores.findIndex(
//       s => s.userId.toString() === userId
//     );

//     const scoreData = {
//       userId,
//       score: aiResult.score ?? 0,
//       matchedSkills: aiResult.matchedSkills ?? [],
//       missingSkills: aiResult.missingSkills ?? [],
//       projectsMatched: aiResult.projectsMatched ?? [],
//       summary: aiResult.summary ?? "",
//       analyzedAt: new Date()
//     };

//     if (existingIndex > -1) {
//       vacancy.aiScores[existingIndex] = scoreData;
//     } else {
//       vacancy.aiScores.push(scoreData);
//     }

//     await vacancy.save();

//     /* ---------- RESPONSE ---------- */
//     res.json(scoreData);

//   } catch (err) {
//     console.error("❌ AI match-score error:", err);
//     res.status(500).json({
//       score: 0,
//       matchedSkills: [],
//       missingSkills: [],
//       projectsMatched: [],
//       summary: "AI service temporarily unavailable"
//     });
//   }
// });

// module.exports = router;



// const express = require("express");
// const router = express.Router();
// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const natural = require("natural");
// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const tokenizer = new natural.WordTokenizer();
// const analysisProgress = {};
// // const analysisProgress = {};

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({
//   model:
//   // "gemini-2.5-pro",
//   //  "gemini-2.5-flash-lite",
//     "gemini-2.5-flash",
//   generationConfig: {
//     responseMimeType: "application/json",
//     temperature: 0.2
//   }
// });


// function cleanText(text) {
//   return text
//     .toLowerCase()
//     .replace(/[^a-z0-9 ]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// function textToVector(text) {
//   const tokens = tokenizer.tokenize(text);
//   const freq = {};
//   tokens.forEach(t => (freq[t] = (freq[t] || 0) + 1));
//   return freq;
// }

// function cosineSimilarity(vecA, vecB) {
//   const intersection = Object.keys(vecA).filter(k => k in vecB);
//   let dot = 0;
//   intersection.forEach(k => (dot += vecA[k] * vecB[k]));

//   const magA = Math.sqrt(
//     Object.values(vecA).reduce((s, v) => s + v * v, 0)
//   );
//   const magB = Math.sqrt(
//     Object.values(vecB).reduce((s, v) => s + v * v, 0)
//   );

//   return magA && magB ? dot / (magA * magB) : 0;
// }

// // async function computePreScore(userId, vacancy) {
// //   try {
// //     const user = await User.findById(userId);
// //     if (!user?.resume) return 0;

// //     const resumePath = path.join(__dirname, "../", user.resume);
// //     const pdf = await pdfParse(fs.readFileSync(resumePath));

// //     const resumeText = cleanText(pdf.text).slice(0, 3000);

// //     const jobText = cleanText(
// //       `${vacancy.skills?.join(" ") || ""} ${vacancy.jobDescription || ""}`
// //     );

// //     const vecA = textToVector(resumeText);
// //     const vecB = textToVector(jobText);

// //     const score = Math.round(cosineSimilarity(vecA, vecB) * 100);

// //     console.log(
// //       `📊 PRE-SCORE | Job: ${vacancy.title} | Score: ${score}`
// //     );

// //     return score;
// //   } catch (err) {
// //     console.error("PreScore error:", err);
// //     return 0;
// //   }
// // }

// async function computePreScore(userId, vacancy) {
//   try {
//     const user = await User.findById(userId);
//     if (!user?.resume) return { score: 0, vector: {} };

//     const resumePath = path.join(__dirname, "../", user.resume);
//     const pdf = await pdfParse(fs.readFileSync(resumePath));
//     const resumeText = cleanText(pdf.text).slice(0, 3000);

//     const jobText = cleanText(
//       `${vacancy.skills?.join(" ") || ""} ${vacancy.jobDescription || ""}`
//     );

//     const vecA = textToVector(resumeText); // resume vector
//     const vecB = textToVector(jobText); // job vector

//     const score = Math.round(cosineSimilarity(vecA, vecB) * 100);

//     console.log(`📊 PRE-SCORE | Job: ${vacancy.title} | Score: ${score}`);

//     return { score, vector: vecA }; // return vector
//   } catch (err) {
//     console.error("PreScore error:", err);
//     return { score: 0, vector: {} };
//   }
// }

// async function analyzeVacancyForUser(userId, vacancyId) {
//   const user = await User.findById(userId);
//   const vacancy = await Vacancy.findById(vacancyId);

//   if (!user?.resume || !vacancy) return;

//   /* ---------- READ RESUME ---------- */
//   const resumePath = path.join(__dirname, "../", user.resume);
//   const buffer = fs.readFileSync(resumePath);
//   const pdfData = await pdfParse(buffer);

//   const resumeText = pdfData.text
//     .replace(/•/g, "-")
//     .replace(/[—–]/g, "-")
//     .replace(/\s+/g, " ")
//     .trim()
//     .slice(0, 3500);

//   /* ---------- JOB DATA ---------- */
//   const jobSkills = (vacancy.skills || []).join(", ");
//   const jobDescription = vacancy.jobDescription|| "";

//   const prompt = `
// You are an Applicant Tracking System (ATS).

// Compare Resume SKILLS + PROJECTS with Job Skills AND Job Description.
// Return realistic ATS score (0–100).

// Return ONLY valid JSON:
// {
//   "score": number,
//   "matchedSkills": [],
//   "missingSkills": [],
//   "projectsMatched": [],
//   "summary": ""
// }

// JOB:
// Skills: ${jobSkills}
// Description: ${jobDescription}

// RESUME:
// ${resumeText}
// `;

//   const result = await model.generateContent(prompt);
//   // const rawText = result.response.text();
// let rawText = result.response.text();

// rawText = rawText
//   .replace(/```json/g, "")
//   .replace(/```/g, "")
//   .trim();

//   let aiResult;
//   try {
//     aiResult = JSON.parse(rawText);
//   } catch {
//     aiResult = {
//       score: 0,
//       matchedSkills: [],
//       missingSkills: [],
//       projectsMatched: [],
//       summary: "AI parsing failed"
//     };
//   }

//   /* ---------- SAVE SCORE ---------- */
//   if (!vacancy.aiScores) vacancy.aiScores = [];

//   const index = vacancy.aiScores.findIndex(
//     s => s.userId.toString() === userId
//   );

//   const scoreData = {
//     userId,
//     score: aiResult.score || 0,
//     matchedSkills: aiResult.matchedSkills || [],
//     missingSkills: aiResult.missingSkills || [],
//     projectsMatched: aiResult.projectsMatched || [],
//     summary: aiResult.summary || "",
//     analyzedAt: new Date()
//   };

//   if (index > -1) vacancy.aiScores[index] = scoreData;
//   else vacancy.aiScores.push(scoreData);

//   await vacancy.save();
// }


// router.get("/dashboard-matches/:userId", async (req, res) => {
//   const { userId } = req.params;

//   const vacancies = await Vacancy.find({
//     aiScores: { $elemMatch: { userId, score: { $gte: 70 } } }
//   }).select("title aiScores");

//   const matches = vacancies.map(v => {
//     const s = v.aiScores.find(a => a.userId.toString() === userId);
//     return { vacancyId: v._id, title: v.title, score: s.score };
//   });

//   res.json({ count: matches.length, matches });
// });

// // router.get("/dashboard-matches/:userId", async (req, res) => {
// //   try {
// //     const { userId } = req.params;

// //     const vacancies = await Vacancy.find({
// //       aiScores: {
// //         $elemMatch: {
// //           userId,
// //           score: { $gte: 70 }
// //         }
// //       }
// //     }).select("title aiScores");

// //     const matches = vacancies.map(v => {
// //       const scoreObj = v.aiScores.find(
// //         s => s.userId.toString() === userId
// //       );

// //       return {
// //         vacancyId: v._id,
// //         title: v.title,
// //         score: scoreObj?.score || 0
// //       };
// //     });

// //     res.json({
// //       count: matches.length,
// //       matches
// //     });
// //   } catch (err) {
// //     console.error("Dashboard match error:", err);
// //     res.status(500).json({ message: "Failed to fetch dashboard matches" });
// //   }
// // });


// // router.post("/match-score", async (req, res) => {
// //   try {
// //     const { userId, vacancyId } = req.body;

// //     await analyzeVacancyForUser(userId, vacancyId);

// //     const vacancy = await Vacancy.findById(vacancyId);
// //     const score = vacancy.aiScores.find(
// //       s => s.userId.toString() === userId
// //     );

// //     res.json(score);
// //   } catch (err) {
// //     console.error("AI match-score error:", err);
// //     res.status(500).json({
// //       score: 0,
// //       matchedSkills: [],
// //       missingSkills: [],
// //       projectsMatched: [],
// //       summary: "AI service unavailable"
// //     });
// //   }
// // });


// router.post("/match-score", async (req, res) => {
//   try {
//     const { userId, vacancyId } = req.body;
//     if (!userId || !vacancyId) {
//       return res.status(400).json({ error: "Missing userId or vacancyId" });
//     }

//     let vacancy = await Vacancy.findById(vacancyId);
//     if (!vacancy) return res.status(404).json({ error: "Vacancy not found" });

//     try {
//       await analyzeVacancyForUser(userId, vacancyId);
//     } catch (err) {
//       if (err.status === 429) {
//         console.warn("Gemini quota exceeded. Skipping AI analysis for this vacancy.");
//       } else {
//         console.error(err);
//       }
//     }

//     vacancy = await Vacancy.findById(vacancyId);
//     const score = vacancy.aiScores?.find(s => s.userId.toString() === userId);

//     return res.json(
//       score || {
//         score: 0,
//         matchedSkills: [],
//         missingSkills: [],
//         projectsMatched: [],
//         summary: "AI analysis pending or quota hit"
//       }
//     );

//   } catch (err) {
//     console.error("AI match-score error:", err);
//     return res.status(500).json({
//       score: 0,
//       matchedSkills: [],
//       missingSkills: [],
//       projectsMatched: [],
//       summary: "AI service error or quota exceeded"
//     });
//   }
// });


// // router.post("/match-score", async (req, res) => {
// //   try {
// //     const { userId, vacancyId } = req.body;

// //     if (!userId || !vacancyId) {
// //       return res.status(400).json({
// //         error: "Missing userId or vacancyId"
// //       });
// //     }

// //     await analyzeVacancyForUser(userId, vacancyId);

// //     const vacancy = await Vacancy.findById(vacancyId);

// //     if (!vacancy) {
// //       return res.status(404).json({
// //         error: "Vacancy not found"
// //       });
// //     }

// //     const score = vacancy.aiScores?.find(
// //       s => s.userId.toString() === userId
// //     );

// //     //  ALWAYS return JSON
// //     return res.json(
// //       score || {
// //         score: 0,
// //         matchedSkills: [],
// //         missingSkills: [],
// //         projectsMatched: [],
// //         summary: "Score not available (AI skipped or quota hit)"
// //       }
// //     );

// //   } catch (err) {
// //     console.error("AI match-score error:", err);

// //     //  RETURN JSON EVEN ON ERROR
// //     return res.status(500).json({
// //       score: 0,
// //       matchedSkills: [],
// //       missingSkills: [],
// //       projectsMatched: [],
// //       projectsMatched: [],
// //       summary: "AI quota exceeded or service error"
// //     });
// //   }
// // });

// router.post("/analyze-all/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const vacancies = await Vacancy.find();

//     analysisProgress[userId] = {
//       analyzed: 0,
//       total: vacancies.length,
//       status: "analyzing"
//     };

//     // ===== PHASE 1: MANUAL PRE-SCORE =====

//     for (const vac of vacancies) {
//   const { score: preScore, vector } = await computePreScore(userId, vac);

//   // remove old preScore
//   await Vacancy.updateOne(
//     { _id: vac._id },
//     { $pull: { preScores: { userId } } }
//   );

//   // save new score + vector
//   await Vacancy.updateOne(
//     { _id: vac._id },
//     {
//       $push: {
//         preScores: {
//           userId,
//           score: preScore,
//           vector
//         }
//       }
//     }
//   );

//   analysisProgress[userId].analyzed++;
// }

//     // for (const vac of vacancies) {
//     //   const preScore = await computePreScore(userId, vac);

//     //   await Vacancy.updateOne(
//     //     { _id: vac._id },
//     //     {
//     //       $pull: { preScores: { userId } } // avoid duplicates
//     //     }
//     //   );

//     //   await Vacancy.updateOne(
//     //     { _id: vac._id },
//     //     {
//     //       $push: {
//     //         preScores: {
//     //           userId,
//     //           score: preScore
//     //         }
//     //       }
//     //     }
//     //   );

//     //   analysisProgress[userId].analyzed++;
//     // }

//     // ===== PHASE 2: AI ONLY TOP MATCHES =====
// //     const updatedVacancies = await Vacancy.find();

// //     const shortlisted = updatedVacancies
// //       .filter(v =>
// //         v.preScores?.some(
// //           s => s.userId.toString() === userId && s.score >= 60
// //         )
// //       )
// //       .slice(0, 5); // TOP 5 ONLY

// //     for (const vac of shortlisted) {
// //       try {
// //         await analyzeVacancyForUser(userId, vac._id);
// //         await new Promise(r => setTimeout(r, 5000)); // avoid quota hit
// //       } catch (err) {
// //         console.log(
// //           "⚠️ Gemini quota / server busy. Skipping AI for:",
// //           vac.title
// //         );
// //       }
// //     }

// //     analysisProgress[userId].status = "completed";
// //     res.json({ message: "Analysis completed successfully" });

// //   } catch (err) {
// //     console.error("Analyze-all error:", err);
// //     res.status(500).json({ message: "Analysis failed" });
// //   }
// // });

// // ===== PHASE 2: AI ONLY TOP MATCHES (VECTOR-BASED) =====
// const updatedVacancies = await Vacancy.find();

// const topMatches = [];

// // Compute top matches using cosine similarity on stored vectors
// updatedVacancies.forEach(v => {
//   const jobText = cleanText(`${v.skills?.join(" ") || ""} ${v.jobDescription || ""}`);
//   const jobVector = textToVector(jobText);

//   v.preScores?.forEach(p => {
//     if (p.userId.toString() === userId) {
//       const similarity = cosineSimilarity(p.vector, jobVector);
//       topMatches.push({ vacancyId: v._id, score: similarity, title: v.title });
//     }
//   });
// });

// // Sort top 5 by similarity
// topMatches.sort((a, b) => b.score - a.score);
// const top5 = topMatches.slice(0, 5);

// // Run AI analysis only on top 5
// for (const match of top5) {
//   try {
//     await analyzeVacancyForUser(userId, match.vacancyId);
//     await new Promise(r => setTimeout(r, 5000)); // avoid quota hit
//   } catch (err) {
//     console.log("⚠️ Gemini quota / server busy. Skipping AI for:", match.title);
//   }
// }

// analysisProgress[userId].status = "completed";
// res.json({ message: "Analysis completed successfully" });
// }
//  catch (err) {
//     console.error("Auto analysis failed:", err);
//     res.status(500).json({ message: "Auto analysis failed" });
//   }
//  });

// // router.post("/analyze-all/:userId", async (req, res) => {
// //   try {
// //     const { userId } = req.params;

// //     const BATCH_SIZE = 1;      // safest for Gemini
// //     const DELAY_MS = 5000;     // 5 sec delay

// //     const vacancies = await Vacancy.find();
// //     const total = vacancies.length;

// //     analysisProgress[userId] = {
// //       analyzed: 0,
// //       total,
// //       status: "analyzing"
// //     };

// //     let analyzed = 0;

// //     for (const vac of vacancies) {
// //       try {
// //         const alreadyDone = vac.aiScores?.some(
// //           s => s.userId.toString() === userId
// //         );

// //         if (!alreadyDone) {
// //           await analyzeVacancyForUser(userId, vac._id);
// //         }

// //         analyzed++;
// //         analysisProgress[userId].analyzed = analyzed;

// //         //  delay EVERY job
// //         await new Promise(res => setTimeout(res, DELAY_MS));

// //       } catch (err) {
// //         console.error(
// //           "Analysis failed for vacancy:",
// //           vac._id.toString(),
// //           err.message
// //         );
// //         analyzed++;
// //         analysisProgress[userId].analyzed = analyzed;
// //       }
// //     }

// //     analysisProgress[userId].status = "completed";

// //     res.json({
// //       message: "All jobs analyzed",
// //       total
// //     });

// //   } catch (err) {
// //     console.error("Auto analysis failed:", err);
// //     res.status(500).json({ message: "Auto analysis failed" });
// //   }
// // });


// router.get("/analysis-progress/:userId", (req, res) => {
//   const progress = analysisProgress[req.params.userId];

//   if (!progress) {
//     return res.json({
//       analyzed: 0,
//       total: 0,
//       status: "idle"
//     });
//   }

//   res.json(progress);
// });


// router.get("/jobs-count", async (req, res) => {
//   try {
//     const totalJobs = await Vacancy.countDocuments();
//     res.json({ total: totalJobs });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch job count" });
//   }
// });




// module.exports = router;






const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const natural = require("natural");
const User = require("../models/User");
const Vacancy = require("../models/Vacancy");

// const tokenizer = new natural.WordTokenizer();
 const analysisProgress = {};



// // GET ANALYSIS PROGRESS
// router.get("/analysis-progress/:userId", (req, res) => {
//   const progress = analysisProgress[req.params.userId];

//   if (!progress) {
//     return res.json({ analyzed: 0, total: 0, status: "idle" });
//   }

//   res.json(progress);
// });

const analyzeResumeVsJob = require("../utils/aiAnalyzeJob");

router.post("/analyze-one", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body missing" });
    }

    const { userId, vacancyId } = req.body;

    if (!userId || !vacancyId) {
      return res.status(400).json({ error: "userId and vacancyId required" });
    }

    const user = await User.findById(userId);
    const vacancy = await Vacancy.findById(vacancyId);

    if (!user?.resume) {
      return res.status(400).json({ error: "Resume missing" });
    }

    if (!vacancy) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    const resumePath = path.join(__dirname, "../", user.resume);
    const pdf = await pdfParse(fs.readFileSync(resumePath));
    const resumeText = pdf.text.slice(0, 3500);

    const aiResult = await analyzeResumeVsJob(resumeText, vacancy);

    await Vacancy.updateOne(
      { _id: vacancyId },
      { $pull: { aiScores: { userId } } }
    );

    await Vacancy.updateOne(
      { _id: vacancyId },
      {
        $push: {
          aiScores: {
            userId,
            score: aiResult.aiScore,
            matchedSkills: aiResult.matchedSkills,
            missingSkills: aiResult.missingSkills,
            summary: aiResult.summary,
            analyzedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, aiScore: aiResult.aiScore });
  } catch (err) {
    console.error("AI analyze-one error:", err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

router.get("/jobs-count", async (req, res) => {
  try {
    const totalJobs = await Vacancy.countDocuments();
    res.json({ total: totalJobs });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job count" });
  }
});



module.exports=router;