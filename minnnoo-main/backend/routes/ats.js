const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const analyzeResumeVsJob = require("../utils/aiAnalyzeJob");
const mongoose = require("mongoose");
const User = require("../models/User");
const Vacancy = require("../models/Vacancy");

const use = require("@tensorflow-models/universal-sentence-encoder");
const tf = require("@tensorflow/tfjs-node");
let useModel;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
async function loadUseModel() {
  if (!useModel) useModel = await use.load();
  return useModel;
}
// const { getEmbedding } = require("../utils/embeddings");
const {
  textToVector,
  cosineSimilarity,
  keywordScore,
  cleanText
} = require("../utils/atsScoring");



async function computeEmbeddingSimilarity(jobText, resumeText) {
  const model = await loadUseModel();
  const embeddings = await model.embed([jobText, resumeText]);
  const [jobVector, resumeVector] = embeddings.arraySync();

  const dotProduct = jobVector.reduce((sum, val, i) => sum + val * resumeVector[i], 0);
  const magA = Math.sqrt(jobVector.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(resumeVector.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (magA * magB);
}


router.get("/dashboard-matches/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const vacancies = await Vacancy.find(
      { "atsScores.userId": userId },
      { atsScores: 1 }
    );

    let matchCount = 0;

    vacancies.forEach(v => {
      const scoreObj = v.atsScores.find(
        s => String(s.userId) === String(userId)
      );

      if (scoreObj && scoreObj.score >= 37) {
        matchCount++;
      }
    });

    res.json({
      count: matchCount
    });
  } catch (err) {
    console.error("Dashboard ATS match error:", err);
    res.status(500).json({ error: "Failed to compute matches" });
  }
});


   const analyzeATSForOne = require("../utils/analyzeATSForOne");

router.post("/analyze-one", async (req, res) => {
  const { userId, vacancyId } = req.body;

  try {
    await analyzeATSForOne(userId, vacancyId);
    res.json({ success: true });
  } catch (err) {
    console.error("ATS analyze-one error:", err);
    res.status(500).json({ error: "ATS failed" });
  }
});




// --- ANALYZE ALL JOBS ---
router.post("/analyze-all/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // --- USER CHECK ---
    const user = await User.findById(userObjectId);
    if (!user?.resume) {
      return res.status(400).json({ error: "Resume missing" });
    }

    // --- READ RESUME ---
    const resumePath = path.join(__dirname, "../", user.resume);
    const pdf = await pdfParse(fs.readFileSync(resumePath));
    const resumeText = pdf.text.slice(0, 3500);

    const resumeVector = textToVector(resumeText);

    // --- FETCH ALL JOBS ---
    const vacancies = await Vacancy.find();
    const results = [];

    // --- ATS SCORING LOOP ---
    for (const job of vacancies) {
      const jobText = `
        ${(job.skills || []).join(" ")}
        ${job.jobDescription || ""}
      `;
      const jobVector = textToVector(jobText);

      // --- Keyword & token-based similarity ---
      const keyword = keywordScore(resumeText, jobText);
      const cosine = cosineSimilarity(resumeVector, jobVector);

      // --- Embedding-based similarity ---
      const embeddingCosine = await computeEmbeddingSimilarity(jobText, resumeText);

      // --- FINAL SCORE (adjust weights as desired) ---
      let finalScore = 0.3 * keyword + 0.2 * cosine + 0.5 * embeddingCosine;
      finalScore = Math.round(finalScore * 100);
      if (finalScore < 15) finalScore = 15;

      results.push({
        vacancyId: job._id,
        title: job.title,
        score: finalScore
      });

      // --- REMOVE OLD ATS SCORE ---
      await Vacancy.updateOne(
        { _id: job._id },
        { $pull: { atsScores: { userId: userObjectId } } }
      );

      // --- SAVE NEW ATS SCORE ---
      await Vacancy.updateOne(
        { _id: job._id },
        {
          $push: {
            atsScores: {
              userId: userObjectId,
              score: finalScore,
              analyzedAt: new Date()
            }
          }
        }
      );
    }

    // --- SORT RESULTS ---
    results.sort((a, b) => b.score - a.score);

    await User.updateOne({ _id: userObjectId }, { $set: { atsAnalyzed: true } });

    // --- AI ANALYSIS ---
    const AI_THRESHOLD = 32;
    const MAX_AI_JOBS = 3;

    const topJobsForAI = results
      .filter(r => r.score >= AI_THRESHOLD)
      .slice(0, MAX_AI_JOBS);

    for (const jobMeta of topJobsForAI) {
      const job = vacancies.find(v => v._id.toString() === jobMeta.vacancyId.toString());
      if (!job) continue;

      const aiResult = await analyzeResumeVsJob(resumeText, job);

      // --- REMOVE OLD AI SCORE ---
      await Vacancy.updateOne(
        { _id: job._id },
        { $pull: { aiScores: { userId: userObjectId } } }
      );

      // --- SAVE AI SCORE ---
      await Vacancy.updateOne(
        { _id: job._id },
        {
          $push: {
            aiScores: {
              userId: userObjectId,
              score: aiResult.aiScore,
              matchedSkills: aiResult.matchedSkills,
              missingSkills: aiResult.missingSkills,
              summary: aiResult.summary,
              analyzedAt: new Date()
            }
          }
        }
      );
    }

    res.json({
      message: "ATS + embeddings analysis completed successfully",
      totalJobs: results.length,
      results
    });

  } catch (err) {
    console.error("ATS analyze error:", err);
    res.status(500).json({ error: "ATS analysis failed" });
  }
});

// router.post("/analyze-all/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findById(userId);
//     if (!user?.resume)
//       return res.status(400).json({ error: "Resume missing" });

//     /* -------- READ RESUME ONCE -------- */
//     const resumePath = path.join(__dirname, "../", user.resume);
//     const pdf = await pdfParse(fs.readFileSync(resumePath));
//     const resumeText = pdf.text.slice(0, 3500);

//     const resumeVector = textToVector(resumeText);

//     /* -------- FETCH ALL JOBS -------- */
//     const vacancies = await Vacancy.find();

//     const results = [];

//     for (const job of vacancies) {
//       const jobText = `
//         ${(job.skills || []).join(" ")}
//         ${job.jobDescription || ""}
//       `;

//       const jobVector = textToVector(jobText);

//       const keyword = keywordScore(resumeText, jobText);
//       const cosine = cosineSimilarity(resumeVector, jobVector);

//       /* ---- FINAL ATS SCORE ---- */
//       let finalScore =
//         0.6 * keyword +
//         0.4 * cosine;

//       finalScore = Math.round(finalScore * 100);

//       /* ---- FLOORING (important) ---- */
//       if (finalScore < 15) finalScore = 15;

//       results.push({
//         vacancyId: job._id,
//         title: job.title,
//         score: finalScore
//       });

//       /* ---- SAVE SCORE ---- */
//       await Vacancy.updateOne(
//         { _id: job._id },
//         {
//           $pull: { atsScores: { userId } }
//         }
//       );

//       await Vacancy.updateOne(
//         { _id: job._id },
//         {
//           $push: {
//             atsScores: {
//               userId,
//               score: finalScore,
//               analyzedAt: new Date()
//             }
//           }
//         }
//       );
//     }

//     /* -------- SORT HIGH → LOW -------- */
//     results.sort((a, b) => b.score - a.score);

//     await User.updateOne(
//   { _id: userId },
//   { $set: { atsAnalyzed: true } }
// );


//     const AI_THRESHOLD = 32;
// const MAX_AI_JOBS = 3;

// const topJobsForAI = results
//   .filter(r => r.score >= AI_THRESHOLD)
//   .sort((a, b) => b.score - a.score)
//   .slice(0, MAX_AI_JOBS);

// //     const TOP_N = 3;

// // const topJobsForAI = results
// //   .filter(r => r.score >= 35) // optional threshold
// //   .slice(0, TOP_N);

//   /* -------- AI ANALYSIS (TOP JOBS ONLY) -------- */
// for (const jobMeta of topJobsForAI) {

//   // HARD STOP — no AI below threshold
//   if (jobMeta.score < AI_THRESHOLD) continue;

//   const job = vacancies.find(
//     v => v._id.toString() === jobMeta.vacancyId.toString()
//   );

//   if (!job) continue;

//   const aiResult = await analyzeResumeVsJob(resumeText, job);

//   await Vacancy.updateOne(
//     { _id: job._id },
//     { $pull: { aiScores: { userId } } }
//   );

//   await Vacancy.updateOne(
//     { _id: job._id },
//     {
//       $push: {
//         aiScores: {
//           userId,
//           score: aiResult.aiScore,
//           matchedSkills: aiResult.matchedSkills,
//           missingSkills: aiResult.missingSkills,
//           summary: aiResult.summary,
//           analyzedAt: new Date()
//         }
//       }
//     }
//   );
// }

//   // await User.updateOne(
//   //   { _id: userId },
//   //   { $set: { atsAnalyzed: true } }
//   // );

//     res.json({
//       message: "ATS analysis completed",
//       totalJobs: results.length,
//       results
//     });

//   } catch (err) {
//     console.error("ATS analyze error:", err);
//     res.status(500).json({ error: "ATS analysis failed" });
//   }
// });

module.exports = router;
