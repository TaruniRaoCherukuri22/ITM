// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const extractResumeText = require("../utils/extractResumeText");
// const getMatchScore = require("../utils/aiMatch");

// // POST /api/ai/match-score
// exports.matchScore = async (req, res) => {
//   try {


//     //    console.log("DEBUG - Request body:", req.body); 
//     const { userId, vacancyId } = req.body;

//     // 1. Fetch user & vacancy
//     const user = await User.findById(userId);
//     const vacancy = await Vacancy.findById(vacancyId);

//     if (!user || !vacancy)
//       return res.status(404).json({ message: "Data not found" });

//     if (!user.resume)
//       return res.status(400).json({ message: "Resume not uploaded" });

//     // 2. Extract text from resume
//     const resumeText = await extractResumeText(`./uploads/${user.resume}`);
//     console.log("Resume text length:", resumeText.length);

//     // 3. Call AI match score
//     const aiResult = await getMatchScore(vacancy.description, resumeText);

//     console.log("AI Result:", aiResult);

//     // 4. Return JSON
//     res.json(aiResult);
//   } catch (err) {
//     console.error("AI match error:", err);
//     res.status(500).json({ message: "AI matching failed" });
//   }
// };



// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const extractResumeText = require("../utils/extractResumeText");
// const getMatchScore = require("../utils/aiMatch");
// const fs = require("fs");

// // POST /api/ai/match-score
// exports.matchScore = async (req, res) => {
//   try {
//     const { userId, vacancyId } = req.body;

//     if (!userId || !vacancyId) {
//       return res.status(400).json({ message: "userId and vacancyId are required" });
//     }

//     // Fetch user & vacancy
//     const user = await User.findById(userId);
//     const vacancy = await Vacancy.findById(vacancyId);

//     if (!user || !vacancy) {
//       return res.status(404).json({ message: "User or Vacancy not found" });
//     }

//     // Build resume path
//     let resumePath = "";
//     if (user.resume) {
//       resumePath = user.resume.startsWith("/uploads/") ? `.${user.resume}` : `./uploads/${user.resume}`;
//     }

//     let resumeText = "";
//     if (resumePath && fs.existsSync(resumePath)) {
//       resumeText = await extractResumeText(resumePath);
//     }

//     // Debug logs
//     console.log("DEBUG - Resume path:", resumePath);
//     console.log("DEBUG - Resume exists:", fs.existsSync(resumePath));
//     console.log("DEBUG - Resume text length:", resumeText.length);

//     // If resume is empty, return score 0 instead of error
//     if (!resumeText) {
//       return res.json({
//         score: 0,
//         missingSkills: [],
//         summary: "Resume is empty or unreadable",
//       });
//     }

//     // Call AI match score
//     let aiResultRaw = {};
//     try {
//       aiResultRaw = await getMatchScore(vacancy.description, resumeText);
//     } catch (err) {
//       console.error("AI scoring failed:", err);
//       return res.json({
//         score: 0,
//         missingSkills: [],
//         summary: "AI scoring failed",
//       });
//     }

//     // Safer parsing
//     const aiResult = {
//       score: Number(aiResultRaw.score) || 0,
//       missingSkills: Array.isArray(aiResultRaw.missingSkills) ? aiResultRaw.missingSkills : [],
//       summary: aiResultRaw.summary || "",
//     };

//     res.json(aiResult);

//   } catch (err) {
//     console.error("Unexpected error in matchScore:", err);
//     res.status(500).json({ message: "Server error in AI matching" });
//   }
// };

// const openai = require("../config/openai");
// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");

// const { extractResumeText } = require("../utils/extractResumeText");


// export const getMatchScore = async (req, res) => {
//   try {
//     const { userId, vacancyId } = req.body;

//     const user = await User.findById(userId);
//     const vacancy = await Vacancy.findById(vacancyId);

//     if (!user || !vacancy) {
//       return res.status(404).json({ message: "User or Vacancy not found" });
//     }

//     let resumeText = "";
//     if (user.resume) {
//       resumeText = await extractResumeText(`.${user.resume}`);
//     }

//     const prompt = `
// You are an ATS system.

// Compare the candidate resume with the job description.

// Return ONLY valid JSON in this format:
// {
//   "score": number (0-100),
//   "missingSkills": string[],
//   "summary": string
// }

// Resume:
// ${resumeText}

// Candidate Skills:
// ${user.skills.join(", ")}

// Job Description:
// ${vacancy.description}
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.2,
//     });

//     const aiResponse = completion.choices[0].message.content;

//     const parsed = JSON.parse(aiResponse);

//     res.json(parsed);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "AI analysis failed" });
//   }
// };





// const openai = require("../config/openai");
// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const { extractResumeText } = require("../utils/extractResumeText");

// exports.getMatchScore = async (req, res) => {
//   try {
//     const { userId, vacancyId } = req.body;

//     const user = await User.findById(userId);
//     const vacancy = await Vacancy.findById(vacancyId);

//     if (!user || !vacancy) {
//       return res.status(404).json({ message: "User or Vacancy not found" });
//     }

//     let resumeText = "";
//     if (user.resume) {
//       resumeText = await extractResumeText(`.${user.resume}`);
//     }

//     const prompt = `
// You are an ATS system.

// Compare the candidate resume with the job description.

// Return ONLY valid JSON in this format:
// {
//   "score": number (0-100),
//   "missingSkills": string[],
//   "summary": string
// }

// Resume:
// ${resumeText}

// Candidate Skills:
// ${user.skills.join(", ")}

// Job Description:
// ${vacancy.description}
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.2,
//     });

//     const aiResponse = completion.choices[0].message.content;
//     const parsed = JSON.parse(aiResponse);

//     res.json(parsed);
//   } catch (err) {
//     console.error("AI analysis failed:", err);
//     res.status(500).json({ message: "AI analysis failed" });
//   }
// };


// const openai = require("../config/openai");
// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const { extractResumeText } = require("../utils/extractResumeText");

// exports.getMatchScore = async (req, res) => {
//   try {
//     const { userId, vacancyId } = req.body;

//     const user = await User.findById(userId);
//     const vacancy = await Vacancy.findById(vacancyId);

//     if (!user || !vacancy) {
//       return res.status(404).json({ message: "User or Vacancy not found" });
//     }

//     console.log("Resume stored in DB:", user.resume);

//     let resumeText = "";
//     if (user.resume) {
//       try {
//         resumeText = await extractResumeText(user.resume);
//       } catch (err) {
//         console.error("Failed to parse resume:", err.message);
//         resumeText = ""; // fallback
//       }
//     }

//     const prompt = `
// You are an ATS system.

// STRICT RULES:
// - Return ONLY valid JSON
// - No markdown, no explanations

// JSON FORMAT:
// {
//   "score": number,
//   "missingSkills": string[],
//   "summary": string
// }

// Resume:
// ${resumeText || "No resume available"}

// Candidate Skills:
// ${user.skills.join(", ")}

// Job Description:
// ${vacancy.description}
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.2,
//     });

//     const aiResponse = completion.choices[0].message.content;
//     console.log("Raw AI Response:", aiResponse);

//     let parsed;
//     try {
//       parsed = JSON.parse(aiResponse);
//     } catch (err) {
//       console.error("Failed to parse AI JSON:", err.message);
//       return res.json({
//         score: 0,
//         missingSkills: [],
//         summary: "AI output was not valid JSON",
//       });
//     }

//     res.json(parsed);
//   } catch (err) {
//     console.error("AI analysis failed:", err);
//     res.status(500).json({ message: "AI analysis failed" });
//   }
// };



// const geminiClient = require("../config/gemini"); // Gemini 3 Pro client
// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const { extractResumeText } = require("../utils/extractResumeText");

// // Limit number of vacancies scored to avoid excessive API calls
// const MAX_VACANCIES_TO_SCORE = 5;

// exports.getVacancyScores = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     // 1️⃣ Get user
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // 2️⃣ Get vacancies (limited for scoring)
//     const vacancies = await Vacancy.find().limit(MAX_VACANCIES_TO_SCORE);

//     // 3️⃣ Extract resume text
//     let resumeText = "";
//     if (user.resume) {
//       try {
//         resumeText = await extractResumeText(user.resume);
//       } catch (err) {
//         console.error("Failed to parse resume:", err.message);
//         resumeText = "";
//       }
//     }

//     // 4️⃣ Score each vacancy with Gemini
//     const scoredVacancies = await Promise.all(
//       vacancies.map(async (vac) => {
//         const prompt = `
// You are an ATS system.

// STRICT RULES:
// - Return ONLY valid JSON
// - No markdown

// JSON FORMAT:
// {
//   "score": number,
//   "missingSkills": string[],
//   "summary": string
// }

// Resume:
// ${resumeText || "No resume available"}

// Candidate Skills:
// ${user.skills.join(", ")}

// Job Description:
// ${vac.description}
//         `;

//         try {
//           const completion = await geminiClient.chat.completions.create({
//             model: "gemini-3-pro-preview",
//             messages: [
//               { role: "system", content: "You are an ATS evaluator that returns only JSON." },
//               { role: "user", content: prompt }
//             ],
//             temperature: 0.2,
//           });

//           const aiResponse = completion.choices[0].message.content;
//           let parsed;
//           try {
//             parsed = JSON.parse(aiResponse);
//           } catch {
//             parsed = { score: 0, missingSkills: [], summary: "AI output invalid JSON" };
//           }

//           return { ...vac.toObject(), ...parsed };

//         } catch (err) {
//           console.error("Gemini scoring failed:", err.message);
//           return { ...vac.toObject(), score: 0, missingSkills: [], summary: "AI request failed" };
//         }
//       })
//     );

//     res.json(scoredVacancies);

//   } catch (err) {
//     console.error("Vacancy scoring failed:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const genAI = require("../config/gemini");
// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const { extractResumeText } = require("../utils/extractResumeText");

// const MAX_VACANCIES_TO_SCORE = 5;
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// const extractJSON = (text) => {
//   const start = text.indexOf("{");
//   const end = text.lastIndexOf("}");
//   if (start === -1 || end === -1) return null;
//   return text.substring(start, end + 1);
// };

// exports.getVacancyScores = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const vacancies = await Vacancy.find().limit(MAX_VACANCIES_TO_SCORE);
//     let resumeText = "";
//     if (user.resume) {
//       try { resumeText = await extractResumeText(user.resume); } 
//       catch (err) { console.error("Resume extraction failed:", err.message); }
//     }
//     if (!resumeText) resumeText = "No resume available";

//     const skillsText = Array.isArray(user.skills) && user.skills.length ? user.skills.join(", ") : "No skills provided";

//     const scoredVacancies = await Promise.all(vacancies.map(async (vac) => {
//       const prompt = `
// You are an ATS system.
// STRICT RULES:
// - Return ONLY valid JSON
// - No explanations
// - No markdown

// JSON FORMAT:
// {
//   "score": number,
//   "missingSkills": string[],
//   "summary": string
// }

// Resume:
// ${resumeText.slice(0, 2000)}

// Candidate Skills:
// ${skillsText}

// Job Description:
// ${vac.description}
//       `;

//       try {
//         const result = await model.generateContent(prompt);
//         const rawText = result.response.text();
//         const jsonText = extractJSON(rawText);

//         let parsed;
//         try { parsed = jsonText ? JSON.parse(jsonText) : null; } 
//         catch { parsed = null; }

//         return {
//           ...vac.toObject(),
//           score: parsed?.score || 0,
//           missingSkills: parsed?.missingSkills || [],
//           summary: parsed?.summary || "Invalid AI response",
//         };
//       } catch (err) {
//         console.error("Gemini scoring failed:", err.message);
//         return { ...vac.toObject(), score: 0, missingSkills: [], summary: "AI request failed" };
//       }
//     }));

//     res.json(scoredVacancies);
//   } catch (err) {
//     console.error("Vacancy scoring failed:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };



// const genAI = require("../config/gemini");
// const User = require("../models/User");
// const Vacancy = require("../models/Vacancy");
// const { extractResumeText } = require("../utils/extractResumeText");

// const MAX_VACANCIES_TO_SCORE = 5;

// // Use Gemini 3 Pro
// const model = genAI.getGenerativeModel({ model: "gemini-3-pro" });

// // Safe JSON extraction from Gemini response
// const extractJSON = (text) => {
//   try {
//     const match = text.match(/\{[\s\S]*\}/);
//     return match ? match[0] : null;
//   } catch {
//     return null;
//   }
// };

// exports.getVacancyScores = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     // 1️⃣ Fetch user
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // 2️⃣ Fetch vacancies
//     const vacancies = await Vacancy.find().limit(MAX_VACANCIES_TO_SCORE);
//     if (!vacancies.length) return res.json([]);

//     // 3️⃣ Extract resume text
//     let resumeText = "";
//     if (user.resume) {
//       try {
//         resumeText = await extractResumeText(user.resume);
//       } catch (err) {
//         console.error("Resume extraction failed:", err.message);
//       }
//     }
//     if (!resumeText) resumeText = "No resume available";

//     // 4️⃣ Prepare skills text
//     const skillsText =
//       Array.isArray(user.skills) && user.skills.length
//         ? user.skills.join(", ")
//         : "No skills provided";

//     // 5️⃣ Score each vacancy using Gemini
//     const scoredVacancies = await Promise.all(
//       vacancies.map(async (vac) => {
//         const prompt = `
// You are an ATS system.
// STRICT RULES:
// - Return ONLY valid JSON
// - No explanations
// - No markdown

// JSON FORMAT:
// {
//   "score": number,
//   "missingSkills": string[],
//   "summary": string
// }

// Resume:
// ${resumeText.slice(0, 8000)}  // send up to 8000 chars

// Candidate Skills:
// ${skillsText}

// Job Description:
// ${vac.description}
//         `;

//         try {
//           const result = await model.generateContent(prompt);

//           // raw text from Gemini
//           const rawText = result.response.text();
//           console.log("Gemini raw output:", rawText); // <-- debug

//           const jsonText = extractJSON(rawText);

//           let parsed;
//           try {
//             parsed = jsonText ? JSON.parse(jsonText) : null;
//           } catch (err) {
//             console.warn("Failed to parse Gemini JSON:", err.message);
//             parsed = null;
//           }

//           return {
//             ...vac.toObject(),
//             score: parsed?.score || 0,
//             missingSkills: parsed?.missingSkills || [],
//             summary: parsed?.summary || "Invalid AI response",
//           };
//         } catch (err) {
//           console.error("Gemini scoring failed:", err.message);
//           return {
//             ...vac.toObject(),
//             score: 0,
//             missingSkills: [],
//             summary: "AI request failed",
//           };
//         }
//       })
//     );

//     // 6️⃣ Send scored vacancies
//     res.json(scoredVacancies);
//   } catch (err) {
//     console.error("Vacancy scoring failed:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };



const genAI = require("../config/gemini");
const User = require("../models/User");
const Vacancy = require("../models/Vacancy");
const { extractResumeText } = require("../utils/extractResumeText");

const MAX_VACANCIES_TO_SCORE = 5;
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const extractJSON = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  return text.substring(start, end + 1);
};

exports.getVacancyScores = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const vacancies = await Vacancy.find().limit(MAX_VACANCIES_TO_SCORE);

    let resumeText = "";
    if (user.resume) {
      try { resumeText = await extractResumeText(user.resume); }
      catch { resumeText = "No resume available"; }
    }

    const skillsText = Array.isArray(user.skills) && user.skills.length
      ? user.skills.join(", ")
      : "No skills provided";

    const scoredVacancies = await Promise.all(
      vacancies.map(async (vac) => {
        const prompt = `
You are an ATS system.
STRICT RULES:
- Return ONLY valid JSON
- No explanations
- No markdown

JSON FORMAT:
{
  "score": number,
  "missingSkills": string[],
  "summary": string
}

Resume:
${resumeText.slice(0, 2000)}

Candidate Skills:
${skillsText}

Job Description:
${vac.description}
        `;
        try {
          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          const jsonText = extractJSON(rawText);

          let parsed;
          try { parsed = jsonText ? JSON.parse(jsonText) : null; } catch { parsed = null; }

          return {
            ...vac.toObject(),
            score: parsed?.score || 0,
            missingSkills: parsed?.missingSkills || [],
            summary: parsed?.summary || "Invalid AI response",
          };
        } catch {
          return { ...vac.toObject(), score: 0, missingSkills: [], summary: "AI request failed" };
        }
      })
    );

    res.json(scoredVacancies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
