// const natural = require("natural");
// const tokenizer = new natural.WordTokenizer();

// /* ---------- CLEAN TEXT ---------- */
// function cleanText(text = "") {
//   return text
//     .toLowerCase()
//     .replace(/[^a-z0-9 ]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// /* ---------- VECTORIZE ---------- */
// function textToVector(text) {
//   const tokens = tokenizer.tokenize(cleanText(text));
//   const freq = {};
//   tokens.forEach(t => (freq[t] = (freq[t] || 0) + 1));
//   return freq;
// }

// /* ---------- COSINE SIM ---------- */
// function cosineSimilarity(vecA, vecB) {
//   const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
//   let dot = 0, magA = 0, magB = 0;

//   keys.forEach(k => {
//     const a = vecA[k] || 0;
//     const b = vecB[k] || 0;
//     dot += a * b;
//     magA += a * a;
//     magB += b * b;
//   });

//   return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
// }

// /* ---------- KEYWORD SCORE ---------- */
// function keywordScore(resumeText, jobText) {
//   const r = new Set(tokenizer.tokenize(cleanText(resumeText)));
//   const j = new Set(tokenizer.tokenize(cleanText(jobText)));

//   let matched = 0;
//   j.forEach(w => r.has(w) && matched++);

//   return j.size ? matched / j.size : 0;
// }

// module.exports = {
//   textToVector,
//   cosineSimilarity,
//   keywordScore,
//   cleanText
// };



const natural = require("natural");
const tokenizer = new natural.WordTokenizer();

/* ---------- CLEAN TEXT ---------- */
function cleanText(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- TOKENIZE ---------- */
function tokenize(text) {
  return tokenizer.tokenize(cleanText(text));
}

/* ---------- VECTORIZE ---------- */
function textToVector(text) {
  const tokens = tokenize(text);
  const freq = {};
  tokens.forEach(t => (freq[t] = (freq[t] || 0) + 1));
  return freq;
}

/* ---------- COSINE SIM ---------- */
function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;

  keys.forEach(k => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

/* ---------- KEYWORD SCORE (ATS-like) ---------- */
function keywordScore(resumeText, jobText) {
  const r = new Set(tokenize(resumeText));
  const j = new Set(tokenize(jobText));

  let matched = 0;
  j.forEach(w => r.has(w) && matched++);

  return j.size ? matched / j.size : 0;
}

/* ---------- SKILL MATCH SCORE (IMPORTANT) ---------- */
function skillMatchScore(resumeText, skills = []) {
  if (!skills.length) return 0;

  const resumeTokens = new Set(tokenize(resumeText));

  let matched = 0;
  skills.forEach(skill => {
    const skillTokens = tokenize(skill);
    const found = skillTokens.some(t => resumeTokens.has(t));
    if (found) matched++;
  });

  return matched / skills.length;
}

module.exports = {
  textToVector,
  cosineSimilarity,
  keywordScore,
  skillMatchScore,
  cleanText
};