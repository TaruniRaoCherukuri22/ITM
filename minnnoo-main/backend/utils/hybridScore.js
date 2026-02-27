const cosineSimilarity = require("./cosine");
const computeATSScore = require("./atsScore");

function computeHybridScore(user, vacancy) {
  const { atsScore, matched } = computeATSScore(
    user.resumeKeywords,
    vacancy.aiKeywords,
    vacancy.title
  );

  let vectorScore = 0;

  if (user.resumeEmbedding.length && vacancy.embedding.length) {
    vectorScore = Math.round(
      cosineSimilarity(user.resumeEmbedding, vacancy.embedding) * 100
    );
  }

  const finalScore = Math.round(
    0.6 * atsScore + 0.4 * vectorScore
  );

  return {
    score: Math.min(95, finalScore),
    atsScore,
    vectorScore,
    matched,
    summary: `Matched skills: ${matched.join(", ")}`
  };
}

module.exports = computeHybridScore;
