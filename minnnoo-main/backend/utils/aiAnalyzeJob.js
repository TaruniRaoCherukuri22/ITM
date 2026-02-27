const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeResumeVsJob(resumeText, job) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const prompt = `
Resume:
${resumeText}

Job Description:
${job.jobDescription}
Skills Required:
${(job.skills || []).join(", ")}

Return JSON ONLY:
{
  "aiScore": number (0-100),
  "matchedSkills": [],
  "missingSkills": [],
  "summary": string
}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

module.exports = analyzeResumeVsJob;
