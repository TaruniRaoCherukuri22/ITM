const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const User = require("../models/User");
const Vacancy = require("../models/Vacancy");

const {
  textToVector,
  cosineSimilarity,
  keywordScore
} = require("./atsScoring");

const use = require("@tensorflow-models/universal-sentence-encoder");
const tf = require("@tensorflow/tfjs-node");
let useModel;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
async function loadUseModel() {
  if (!useModel) useModel = await use.load();
  return useModel;
}

async function computeEmbeddingSimilarity(jobText, resumeText) {
  const model = await loadUseModel();
  const embeddings = await model.embed([jobText, resumeText]);
  const [jobVector, resumeVector] = embeddings.arraySync();

  const dotProduct = jobVector.reduce((sum, val, i) => sum + val * resumeVector[i], 0);
  const magA = Math.sqrt(jobVector.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(resumeVector.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (magA * magB);
}
module.exports = async function analyzeATSForOne(userId, vacancyId) {
  const user = await User.findById(userId);
  if (!user?.resume) return;

  const job = await Vacancy.findById(vacancyId);
  if (!job) return;

  // 📄 Read resume
  const resumePath = path.join(__dirname, "../", user.resume);
  const pdf = await pdfParse(fs.readFileSync(resumePath));
  const resumeText = pdf.text.slice(0, 3500);

  const resumeVector = textToVector(resumeText);

  // 📌 Job text
  const jobText = `
    ${(job.skills || []).join(" ")}
    ${job.jobDescription || ""}
  `;

  const jobVector = textToVector(jobText);

  const keyword = keywordScore(resumeText, jobText);
  const cosine = cosineSimilarity(resumeVector, jobVector);
     const embeddingCosine = await computeEmbeddingSimilarity(jobText, resumeText);

      // --- FINAL SCORE (adjust weights as desired) ---
      let finalScore = 0.3 * keyword + 0.2 * cosine + 0.5 * embeddingCosine;
 finalScore = Math.round(finalScore * 100);
  // let finalScore = Math.round((0.6 * keyword + 0.4 * cosine) * 100);
  if (finalScore < 15) finalScore = 15;

  // 🧹 Remove old score
  await Vacancy.updateOne(
    { _id: vacancyId },
    { $pull: { atsScores: { userId } } }
  );

  // 💾 Save ATS score
  await Vacancy.updateOne(
    { _id: vacancyId },
    {
      $push: {
        atsScores: {
          userId,
          score: finalScore,
          analyzedAt: new Date()
        }
      }
    }
  );
};
