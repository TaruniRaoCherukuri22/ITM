// const natural = require("natural");
// const { TfIdf } = natural;
// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");

// // ----------------- READ RESUME -----------------
// async function readResumeText(resumeFileName) {
//   try {
//     // Point to the uploads folder
//       resumeFileName = resumeFileName.replace(/^uploads[\/\\]/, "");
//    const resumePath = path.join(__dirname, "..",resumeFileName);
//     // const resumePath = path.join(__dirname, "./uploads", resumeFileName);
//     // const resumePath = path.join(__dirname, "../uploads", resumeFileName);

//     if (!fs.existsSync(resumePath)) {
//       console.warn("Resume file not found:", resumePath);
//       return "";
//     }

//     const buffer = fs.readFileSync(resumePath);
//     const pdfData = await pdfParse(buffer);

//     // Clean up text and limit to 3500 characters
//     return pdfData.text.replace(/\s+/g, " ").trim().slice(0, 3500);
//   } catch (err) {
//     console.error("Error parsing PDF:", err);
//     return "";
//   }
// }

// // ----------------- TF-IDF VECTOR & COSINE -----------------
// function textToVector(text1, text2) {
//   const tfidf = new TfIdf();
//   tfidf.addDocument(text1);
//   tfidf.addDocument(text2);

//   const docA = tfidf.documents[0];
//   const docB = tfidf.documents[1];

//   return { docA, docB };
// }

// function cosineSimilarity(docA, docB) {
//   const allTerms = new Set([...Object.keys(docA), ...Object.keys(docB)]);
//   let dot = 0, magA = 0, magB = 0;

//   allTerms.forEach(term => {
//     const a = docA[term] || 0;
//     const b = docB[term] || 0;
//     dot += a * b;
//     magA += a * a;
//     magB += b * b;
//   });

//   return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
// }

// // ----------------- HYBRID SCORE -----------------
// async function computePreScore(user, vacancy) {
//   try {
//     if (!user?.resume) return { score: 0, keywordScore: 0 };

//     // Pass only the file name
//     const resumeText = await readResumeText(user.resume);
//     if (!resumeText) return { score: 0, keywordScore: 0 };

//     // Combine JD skills + description
//     const jobText = `${vacancy.skills?.join(" ") || ""} ${vacancy.jobDescription || ""}`;

//     // Convert texts to vectors
//     const { docA, docB } = textToVector(resumeText, jobText);

//     // Cosine similarity for semantic matching
//     const semanticScore = cosineSimilarity(docA, docB) * 100;

//     // Keyword overlap score (exact skill matches)
//     const resumeLower = resumeText.toLowerCase();
//     const matched = vacancy.skills?.filter(skill => resumeLower.includes(skill.toLowerCase())).length || 0;
//     const keywordScore = vacancy.skills?.length ? (matched / vacancy.skills.length) * 100 : 0;

//     // Final hybrid score
//     const finalScore = Math.round(0.6 * semanticScore + 0.4 * keywordScore);

//     return { score: finalScore, keywordScore };
//   } catch (err) {
//     console.error("PreScore error:", err);
//     return { score: 0, keywordScore: 0 };
//   }
// }

// module.exports = { computePreScore };



const natural = require("natural");
const { TfIdf, NGrams } = natural;
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

/* ----------------- READ RESUME ----------------- */
async function readResumeText(resumeFileName) {
  try {
    resumeFileName = resumeFileName.replace(/^uploads[\/\\]/, "");
    const resumePath = path.join(__dirname, "..", resumeFileName);

    if (!fs.existsSync(resumePath)) return "";

    const buffer = fs.readFileSync(resumePath);
    const pdfData = await pdfParse(buffer);

    return pdfData.text
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000)
      .toLowerCase();
  } catch {
    return "";
  }
}

/* ----------------- TF-IDF + BIGRAMS ----------------- */
function textToVectorWithNgrams(text1, text2 = "") {
  const tfidf = new TfIdf();
  tfidf.addDocument(text1);
  if (text2) tfidf.addDocument(text2);

  const docA = { ...tfidf.documents[0] };
  const docB = text2 ? { ...tfidf.documents[1] } : {};

  const addBigrams = (text, doc) => {
    const words = text.split(/\W+/);
    NGrams.ngrams(words, 2).forEach(g => {
      const k = g.join(" ");
      doc[k] = (doc[k] || 0) + 1;
    });
  };

  addBigrams(text1, docA);
  if (text2) addBigrams(text2, docB);

  return { docA, docB };
}

/* ----------------- COSINE ----------------- */
function cosineSimilarity(a, b) {
  const terms = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, ma = 0, mb = 0;

  for (const t of terms) {
    const x = a[t] || 0;
    const y = b[t] || 0;
    dot += x * y;
    ma += x * x;
    mb += y * y;
  }
  return ma && mb ? dot / (Math.sqrt(ma) * Math.sqrt(mb)) : 0;
}

const normalizeCosine = s => Math.min(100, Math.max(0, s * 400));

/* ----------------- SKILL MATCH ----------------- */
function skillMatch(text, skill) {
  return new RegExp(`\\b${skill}\\b|${skill}`, "i").test(text);
}

/* ----------------- ROLE BOOST ----------------- */
function roleBoost(title, keywordScore) {
  const t = title.toLowerCase();
  if (t.includes("sde-3") && keywordScore >= 60) return 10;
  if (t.includes("sde-2") && keywordScore >= 55) return 7;
  if (t.includes("sde-1") && keywordScore >= 50) return 5;
  return 0;
}

/* ----------------- ATS EXPLANATION ----------------- */
function generateATSExplanation(resumeText, skills) {
  const matched = [];
  const missing = [];

  skills.forEach(s =>
    skillMatch(resumeText, s) ? matched.push(s) : missing.push(s)
  );

  return {
    matchedSkills: matched,
    missingSkills: missing,
    summary: matched.length
      ? `Matched skills: ${matched.slice(0, 6).join(", ")}`
      : "Few core skills matched"
  };
}

/* ----------------- HYBRID SCORE ----------------- */
async function computeHybridScore(resumeText, vacancy, embeddingScore = null) {
  const skills = vacancy.skills || [];
  const jobText = `${skills.join(" ")} ${vacancy.jobDescription || ""}`.toLowerCase();

  // semantic
  const { docA, docB } = textToVectorWithNgrams(resumeText, jobText);
  const semanticScore = normalizeCosine(cosineSimilarity(docA, docB));

  // keyword
  const matched = skills.filter(s => skillMatch(resumeText, s)).length;
  const keywordScore = skills.length ? (matched / skills.length) * 100 : 0;

  const isShortJD = jobText.split(" ").length < 120;

  let finalScore = embeddingScore !== null
    ? (isShortJD
        ? 0.55 * keywordScore + 0.30 * embeddingScore + 0.15 * semanticScore
        : 0.45 * embeddingScore + 0.35 * keywordScore + 0.20 * semanticScore)
    : 0.65 * keywordScore + 0.35 * semanticScore;

  finalScore += roleBoost(vacancy.title || "", keywordScore);

  if (keywordScore >= 60 && finalScore < 55) finalScore = 55;

  finalScore = Math.min(100, Math.round(finalScore));

  return {
    finalScore,
    keywordScore,
    explanation: generateATSExplanation(resumeText, skills)
  };
}

/* ----------------- VECTOR INDEX ----------------- */
let jobVectors = [];
let jobIds = [];

function buildIndex(jobs) {
  jobVectors = [];
  jobIds = [];

  jobs.forEach(j => {
    const text = `${(j.skills || []).join(" ")} ${j.jobDescription || ""}`.toLowerCase();
    jobVectors.push(textToVectorWithNgrams(text).docA);
    jobIds.push(j._id.toString());
  });
}

async function queryResume(resumeText, topK = 10) {
  const rv = textToVectorWithNgrams(resumeText).docA;

  const scores = jobVectors.map((v, i) => ({
    jobId: jobIds[i],
    score: normalizeCosine(cosineSimilarity(rv, v))
  }));

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK);
}

module.exports = {
  readResumeText,
  computeHybridScore,
  buildIndex,
  queryResume
};
