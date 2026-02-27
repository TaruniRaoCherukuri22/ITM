// const { GoogleGenerativeAI } = require("@google/generative-ai");
 
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 
// async function getMatchScore(jd, resumeText) {
//   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
 
//   const prompt = `
// You are an ATS system.
 
// Compare the following Job Description and Resume.
 
// Return output STRICTLY in JSON format:
// {
//   "score": number (0-100),
//   "missingSkills": [],
//   "summary": ""
// }
 
// Job Description:
// ${jd}
 
// Resume:
// ${resumeText}
// `;
 
//   const result = await model.generateContent(prompt);
//   const response = result.response.text();
 
//   return JSON.parse(response);
// }
 
// module.exports = getMatchScore;




const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getMatchScore(jd, resumeText) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
You are an ATS system.

Compare the following Job Description and Resume.

Return output STRICTLY in JSON format:
{
  "score": number (0-100),
  "missingSkills": [],
  "summary": ""
}

Job Description:
${jd}

Resume:
${resumeText}
`;

  const result = await model.generateContent(prompt);

  // ✅ Correct parsing
  if (!result.candidates || !result.candidates[0]?.content?.[0]?.text) {
    throw new Error("Invalid AI response structure");
  }

  const text = result.candidates[0].content[0].text;

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse AI JSON:", text, err);
    throw err;
  }
}

module.exports = getMatchScore;
