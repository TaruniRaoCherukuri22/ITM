// const detectIntent = require("../utils/intentDetector");
// console.log("detectIntent type:", typeof detectIntent);
// const Vacancy = require("../models/Vacancy");
// const Application = require("../models/");
// const mongoose = require("mongoose");

// exports.askQuestion = async (req, res) => {
//   try {
//     const { userId, message } = req.body;

//     const { intent, confidence } = await detectIntent(message);

//     if (confidence < 0.6 || intent === "unknown") {
//       return res.json({
//         reply:
//           "I didn’t fully understand 🤔 You can ask about jobs, ATS score, or applications."
//       });
//     }

//     switch (intent) {
//       case "get_vacancies": {
//         const vacancies = await Vacancy.find();
//         return res.json({
//           reply: `There are ${vacancies.length} open positions.`,
//           data: vacancies
//         });
//       }

//       case "get_ats_score": {
//         const app = await Application.findOne({ userId });
//         return res.json({
//           reply: app
//             ? `Your ATS score is ${app.atsScore}/100`
//             : "You haven't applied yet."
//         });
//       }
// case "match_jobs": {
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.json({
//       reply: "Invalid user id"
//     });
//   }

//   const userObjectId = new mongoose.Types.ObjectId(userId);

//   // 🔥 Fetch ALL vacancies that have aiScores
//   const vacancies = await Vacancy.find({
//     aiScores: { $exists: true, $ne: [] }
//   });

//   const matchedJobs = [];

//   for (const v of vacancies) {
//     const ai = v.aiScores.find(
//       s => s.userId.toString() === userObjectId.toString()
//     );

//     if (ai) {
//       matchedJobs.push({
//         jobId: v._id,
//         title: v.title,
//         company: v.company,
//         atsScore: ai.score,
//         matchedSkills: ai.matchedSkills,
//         missingSkills: ai.missingSkills,
//         summary: ai.summary
//       });
//     }
//   }

//   if (matchedJobs.length === 0) {
//     return res.json({
//       reply:
//         "No matching jobs found yet. Your resume may not be analyzed."
//     });
//   }

//   return res.json({
//     reply: "These jobs match your profile:",
//     data: matchedJobs
//   });
// }  // case "match_jobs": {
//       //   const apps = await Application.find({ userId }).populate("vacancyId");
//       //   return res.json({
//       //     reply: "These jobs match your profile:",
//       //     data: apps.map(a => ({
//       //       job: a.vacancyId.title,
//       //       atsScore: a.atsScore
//       //     }))
//       //   });
//       // }

//       case "application_status": {
//         const apps = await Application.find({ userId }).populate("vacancyId");
//         return res.json({
//           reply: "Your application statuses:",
//           data: apps.map(a => ({
//             job: a.vacancyId.title,
//             status: a.status
//           }))
//         });
//       }

//       default:
//         return res.json({
//           reply: "I can help with jobs, ATS score, and applications."
//         });
//     }
//   } catch (err) {
//     console.error("Chatbot error:", err);
//     res.status(500).json({
//       reply: "Something went wrong. Please try again."
//     });
//   }
// };



const detectIntent = require("../utils/intentDetector");
const Vacancy = require("../models/Vacancy");
// const Application = require("../models/Application");
const mongoose = require("mongoose");

exports.askQuestion = async (req, res) => {
  try {
    const { userId, message, vacancyId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ reply: "Invalid user id" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const { intent, confidence } = await detectIntent(message);

    if (confidence < 0.6 || intent === "unknown") {
      return res.json({
        reply:
          "I didn’t fully understand 🤔 You can ask about jobs, ATS score, or applications."
      });
    }

    switch (intent) {
      /* ---------------- GET VACANCIES ---------------- */
      case "get_vacancies": {
        const vacancies = await Vacancy.find();
        return res.json({
          reply: `There are ${vacancies.length} open positions.`,
          data: vacancies
        });
      }


      case "get_ats_score": {
  let vacancy;

  /* ---------------- 1️⃣ FIND VACANCY ---------------- */

  // 1️⃣ If vacancyId is provided
  if (vacancyId && mongoose.Types.ObjectId.isValid(vacancyId)) {
    vacancy = await Vacancy.findOne(
      { _id: vacancyId },
      { title: 1, aiScores: 1, atsScores: 1 }
    );
  }

  // 2️⃣ Otherwise → extract job title from message
  else {
    const cleaned = message
      .toLowerCase()
      .replace(/\b(ats|ai|score|for|my|job|the)\b/g, "")
      .trim();

    // ❗ If message becomes empty, stop early
    if (!cleaned) {
      return res.json({
        reply: "Please mention the job title to get your ATS score."
      });
    }

    // Escape regex characters (important for se-2, sde-2)
    const escaped = cleaned.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    // Allow flexible formats: se-2, se 2, se2
    const pattern = escaped.replace(/\s+/g, ".*");

    vacancy = await Vacancy.findOne(
      {
        title: { $regex: pattern, $options: "i" }
      },
      { title: 1, aiScores: 1, atsScores: 1 }
    );
  }

  if (!vacancy) {
    return res.json({
      reply: "I couldn't find that job. Please try a clearer job title."
    });
  }

  /* ---------------- 2️⃣ FIND USER SCORES ---------------- */

  const ai = vacancy.aiScores?.find(
    s => s.userId?.toString() === userObjectId.toString()
  );

  const ats = vacancy.atsScores?.find(
    s => s.userId?.toString() === userObjectId.toString()
  );

  if (!ai && !ats) {
    return res.json({
      reply: `No ATS analysis found yet for ${vacancy.title}. Please analyze your resume first.`
    });
  }

  /* ---------------- 3️⃣ PICK BEST SCORE ---------------- */

  const score = ai?.score ?? ats?.score;
  const scoreType = ai ? "AI" : "ATS";

  return res.json({
    reply: `Your ${scoreType} score for ${vacancy.title} is ${score}/100`,
    data: {
      atsScore: score,
      scoreType,
      matchedSkills: ai?.matchedSkills || [],
      missingSkills: ai?.missingSkills || []
    }
  });
}
      /* ---------------- GET ATS SCORE ---------------- */
// case "get_ats_score": {
//   let vacancy;

//   /* ---------------- 1️⃣ FIND VACANCY ---------------- */

//   // If vacancyId is provided
//   if (vacancyId && mongoose.Types.ObjectId.isValid(vacancyId)) {
//     vacancy = await Vacancy.findOne(
//       { _id: vacancyId },
//       { title: 1, aiScores: 1, atsScores: 1 }
//     );
//   }
//   // Otherwise match by job title from message

//   // 2️⃣ Otherwise → extract job title from message
// else {
//   const cleaned = message
//     .toLowerCase()
//     .replace(/ats|score|for|my|job|the/g, "")
//     .trim();

//   // escape regex chars (important for se-2, sde-2, etc.)
//   const escaped = cleaned.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

//   // allow flexible spacing (se-2, se 2, se2)
//   const pattern = escaped.replace(/\s+/g, ".*");

//   vacancy = await Vacancy.findOne(
//     {
//       title: { $regex: pattern, $options: "i" }
//     },
//     { title: 1, aiScores: 1, atsScores: 1 }
//   );
// }
//   // else {
//   //   vacancy = await Vacancy.findOne(
//   //     {
//   //       title: { $regex: message, $options: "i" }
//   //     },
//   //     { title: 1, aiScores: 1, atsScores: 1 }
//   //   );
//   // }

//   if (!vacancy) {
//     return res.json({
//       reply: "I couldn't find that job. Please try a clearer job title."
//     });
//   }

//   /* ---------------- 2️⃣ FIND USER SCORES ---------------- */

//   const ai = vacancy.aiScores?.find(
//     s => s.userId.toString() === userObjectId.toString()
//   );

//   const ats = vacancy.atsScores?.find(
//     s => s.userId.toString() === userObjectId.toString()
//   );

//   if (!ai && !ats) {
//     return res.json({
//       reply: `No ATS score found yet for ${vacancy.title}. Please analyze your resume first.`
//     });
//   }

//   /* ---------------- 3️⃣ PICK BEST SCORE ---------------- */

//   const score = ai?.score ?? ats?.score;
//   const scoreType = ai ? "AI" : "ATS";

//   return res.json({
//     reply: `Your ${scoreType} score for ${vacancy.title} is ${score}/100`,
//     data: {
//       atsScore: score,
//       scoreType,
//       matchedSkills: ai?.matchedSkills || [],
//       missingSkills: ai?.missingSkills || []
//     }
//   });
// }
      // case "get_ats_score": {
      //   if (!vacancyId || !mongoose.Types.ObjectId.isValid(vacancyId)) {
      //     return res.json({
      //       reply: "Please specify the job you want the ATS score for."
      //     });
      //   }

      //   const vacancy = await Vacancy.findOne(
      //     {
      //       _id: vacancyId,
      //       "aiScores.userId": userObjectId
      //     },
      //     {
      //       "aiScores.$": 1
      //     }
      //   );

      //   if (!vacancy || vacancy.aiScores.length === 0) {
      //     return res.json({
      //       reply:
      //         "Your resume has not been analyzed for this job yet."
      //     });
      //   }

      //   const ai = vacancy.aiScores[0];

      //   return res.json({
      //     reply: `Your ATS score for this job is ${ai.score}/100`,
      //     data: {
      //       score: ai.score,
      //       matchedSkills: ai.matchedSkills,
      //       missingSkills: ai.missingSkills,
      //       projectsMatched: ai.projectsMatched,
      //       summary: ai.summary,
      //       analyzedAt: ai.analyzedAt
      //     }
      //   });
      // }


      case "match_jobs": {
  const ATS_THRESHOLD = 32;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // ✅ Fetch ALL vacancies (do not filter by aiScores)
  const vacancies = await Vacancy.find({ status: "Active" });

  const matchingJobs = [];

  for (const job of vacancies) {
    let score = null;
    let scoreType = null;

    // 1️⃣ Prefer AI score if available
    if (Array.isArray(job.aiScores)) {
      const ai = job.aiScores.find(
        s => s.userId.toString() === userObjectId.toString()
      );
      if (ai) {
        score = ai.score;
        scoreType = "AI";
      }
    }

    // 2️⃣ Fallback to ATS score
    if (score === null && Array.isArray(job.atsScores)) {
      const ats = job.atsScores?.find(
  s => s.userId?.toString() === userObjectId.toString()
);
      // const ats = job.atsScores.find(
      //   s => s.userId.toString() === userObjectId.toString()
      // );
      if (ats) {
        score = ats.score;
        scoreType = "ATS";
      }
    }

    // 3️⃣ Apply threshold
    if (score !== null && score >= ATS_THRESHOLD) {
     matchingJobs.push({
  jobId: job._id,
  title: job.title,
  company: job.company,
  location: job.location,
  atsScore: score,      // ✅ unified name
  scoreType
});
    }
  }

  if (matchingJobs.length === 0) {
    return res.json({
      reply:
        "No matching jobs found (score > 32). Upload a better resume to improve matches."
    });
  }

  // 🔽 Sort high → low
  matchingJobs.sort((a, b) => b.score - a.score);

  return res.json({
    reply: "Jobs matching your profile:",
    data: matchingJobs
  });
}
//   case "match_jobs": {
//   const ATS_THRESHOLD = 32;

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.json({ reply: "Invalid user id" });
//   }

//   const userObjectId = new mongoose.Types.ObjectId(userId);

//   // 🔥 Fetch only jobs that have ATS scores
//   const vacancies = await Vacancy.find({
//     atsScores: { $exists: true, $ne: [] }
//   });

//   const highMatchingJobs = [];

//   for (const job of vacancies) {
//     const ats = job.atsScores.find(
//       s => s.userId.toString() === userObjectId.toString()
//     );

//     // ✅ FILTER: ATS > 32
//     if (ats && ats.score >= ATS_THRESHOLD) {
//       highMatchingJobs.push({
//         jobId: job._id,
//         title: job.title,
//         company: job.company,
//         location: job.location,
//         atsScore: ats.score
//       });
//     }
//   }

//   if (highMatchingJobs.length === 0) {
//     return res.json({
//       reply:
//         "No high matching jobs found (ATS score > 32). Improve your resume and try again."
//     });
//   }

//   // 🔽 Sort HIGH → LOW
//   highMatchingJobs.sort((a, b) => b.atsScore - a.atsScore);

//   return res.json({
//     reply: "High matching jobs based on your resume:",
//     data: highMatchingJobs
//   });
// }



      case "get_missing_skills": {
  let vacancy;

  /* ---------------- 1️⃣ CLEAN MESSAGE ---------------- */

  const cleaned = message
    .toLowerCase()
    .replace(/\b(what|skills|are|is|missed|missing|for|role|job|the|my)\b/g, "")
    .trim();

  if (!cleaned) {
    return res.json({
      reply: "Please mention the job title to check missing skills."
    });
  }

  // Escape regex characters (VERY IMPORTANT for se-2, sde-2)
  const escaped = cleaned.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  // Allow: se-2, se 2, se2
  const pattern = escaped.replace(/\s+/g, ".*");

  /* ---------------- 2️⃣ FIND VACANCY ---------------- */

  vacancy = await Vacancy.findOne(
    {
      title: { $regex: pattern, $options: "i" }
    },
    { title: 1, aiScores: 1 }
  );

  if (!vacancy) {
    return res.json({
      reply: "I couldn't find that job. Please try a clearer job title."
    });
  }

  /* ---------------- 3️⃣ FIND USER AI SCORE ---------------- */

  const ai = vacancy.aiScores?.find(
    s => s.userId?.toString() === userObjectId.toString()
  );

  if (!ai) {
    return res.json({
      reply: `AI analysis not found yet for ${vacancy.title}. Please run ATS analysis first.`
    });
  }

  if (!ai.missingSkills || ai.missingSkills.length === 0) {
    return res.json({
      reply: `Great news! You are not missing any major skills for ${vacancy.title}. 🎉`
    });
  }

  /* ---------------- 4️⃣ RETURN MISSING SKILLS ---------------- */

  return res.json({
    reply: `For the role ${vacancy.title}, you are missing the following skills:\n• ${ai.missingSkills.join("\n• ")}`,
    data: {
      missingSkills: ai.missingSkills
    }
  });
}

      /* ---------------- APPLICATION STATUS ---------------- */
      case "application_status": {
        const apps = await Application.find({ userId })
          .populate("vacancyId", "title");

        if (apps.length === 0) {
          return res.json({
            reply: "You haven't applied to any jobs yet."
          });
        }

        return res.json({
          reply: "Your application statuses:",
          data: apps.map(a => ({
            job: a.vacancyId.title,
            status: a.status
          }))
        });
      }

      default:
        return res.json({
          reply: "I can help with jobs, ATS score, and applications."
        });
    }
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({
      reply: "Something went wrong. Please try again."
    });
  }
};
