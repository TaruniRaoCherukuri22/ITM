const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");

// ✅ Import existing models
const User = require("../models/User");
const Vacancy = require("../models/Vacancy");

// ================= RULE-BASED QUERY ENGINE =================
async function processQuery(query) {
  const q = query.toLowerCase();

  // Helper for standardized structured response
  const response = (text, data = null, type = "text") => ({ text, data, type });

  // 1. HELP / GREETINGS
  if (q.includes("help") || q.includes("who are you") || q.includes("hi") || q.includes("hello")) {
    return response("I am your HR Assistant! I can help you manage employees, jobs, and analytics.", [
      { action: "company overview", description: "Company Stats" },
      { action: "urgent jobs", description: "Hiring Urgency" },
      { action: "skill demand", description: "Supply vs Demand" },
      { action: "recent hires", description: "Recent Activity" },
      { action: "users", description: "View Employees" }
    ], "suggestions");
  }

  // 2. COMPANY OVERVIEW / STATS
  if (q.includes("overview") || q.includes("stats") || q.includes("summary") || q.includes("dashboard")) {
    const totalUsers = await User.countDocuments();
    const activeJobs = await Vacancy.countDocuments({ status: "Active" });
    const usersWithAts = await User.countDocuments({ atsAnalyzed: true });

    const users = await User.find();
    const skillMap = {};
    users.forEach(u => (u.skills || []).forEach(s => skillMap[s] = (skillMap[s] || 0) + 1));
    const topSkill = Object.entries(skillMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    return response("Here is your organization's quick overview:", [
      { Metric: "Total Employees", Value: totalUsers },
      { Metric: "Active Job Openings", Value: activeJobs },
      { Metric: "Top Internal Skill", Value: topSkill.toUpperCase() },
      { Metric: "ATS Screened Profiles", Value: usersWithAts }
    ], "table");
  }

  // 3. ATS SCORES / TOP CANDIDATES (Higher Priority to avoid overlap)
  if (q.includes("score") || q.includes("ranking") || q.includes("ats") || q.includes("top candidate") || q.includes("best match") || q.includes("top matched employee") || q.includes("top employee") || q.includes("top match")) {

    // Extract subject (what follows the keywords)
    const subject = q.replace(/top|best|match|matched|employee|candidate|score|ranking|ats|for|of/g, "").trim();

    if (subject.length > 2) {
      // Priority 1: Check for Job Vacancy Match
      const vacancy = await Vacancy.findOne({ title: { $regex: new RegExp(subject, "i") } });
      if (vacancy && vacancy.atsScores?.length > 0) {
        const top = vacancy.atsScores.sort((a, b) => b.score - a.score)[0];
        if (top) {
          const user = await User.findById(top.userId);
          return response(`Top candidate for ${vacancy.title}:`, [
            { Candidate: user?.name || "Unknown", "ATS Score": `${top.score}%`, Designation: user?.designation || "Staff" }
          ], "table");
        }
      }

      // Priority 2: Check for Candidate/User Match
      const user = await User.findOne({ name: { $regex: new RegExp(subject, "i") } });
      if (user) {
        const userVacancies = await Vacancy.find({ "atsScores.userId": user._id });
        if (userVacancies.length > 0) {
          const personalScores = userVacancies.map(v => {
            const scoreObj = v.atsScores.find(s => String(s.userId) === String(user._id));
            return {
              "Job Position": v.title,
              "Match Score": `${scoreObj?.score || 0}%`,
              "Status": (scoreObj?.score || 0) >= 32 ? "✅ Qualified" : "❌ Below Threshold"
            };
          });
          return response(`ATS scores for candidate ${user.name}:`, personalScores, "table");
        }
      }
    }

    // Default: Top candidate for each active vacancy
    const vacancies = await Vacancy.find({ "atsScores.0": { $exists: true } });
    if (!vacancies.length) return response("No candidate rankings found. Run ATS analysis first from the dashboard.");

    const results = [];
    for (const v of vacancies) {
      const top = v.atsScores.sort((a, b) => b.score - a.score)[0];
      if (top) {
        const user = await User.findById(top.userId);
        results.push({ Job: v.title, Best: user?.name || "Unknown", Score: `${top.score}%` });
      }
    }
    return response("Top matched employee for each active vacancy:", results, "table");
  }

  // 4. HIRING URGENCY (Expiring Jobs)
  if (q.includes("urgent") || q.includes("expiring") || q.includes("soon") || q.includes("due")) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const urgentVacancies = await Vacancy.find({
      status: "Active",
      expiresOn: { $lte: nextWeek }
    }).limit(10);

    if (!urgentVacancies.length) return response("No job openings are expiring in the next 7 days. All timelines look stable.");

    return response("The following vacancies are expiring soon and may need immediate attention:",
      urgentVacancies.map(v => ({
        Title: v.title,
        Department: v.department,
        "Expires On": new Date(v.expiresOn).toLocaleDateString(),
        Location: v.location
      })), "table");
  }

  // 5. RECENT ACTIVITY (New Hires/Signups)
  if (q.includes("recent") || q.includes("new hires") || q.includes("latest") || q.includes("who joined")) {
    const recentUsers = await User.find().sort({ _id: -1 }).limit(5);
    if (!recentUsers.length) return response("No recent employee activity detected.");

    return response("Latest employees who joined the platform:",
      recentUsers.map(u => ({
        Name: u.name,
        Email: u.email,
        Designation: u.designation || "Staff",
        "Joined At": u._id.getTimestamp().toLocaleDateString()
      })), "table");
  }

  // 6. SKILL DEMAND vs SUPPLY
  if (q.includes("demand") || q.includes("hiring for") || q.includes("missing skills")) {
    const vacancies = await Vacancy.find({ status: "Active" });
    const demandMap = {};
    vacancies.forEach(v => (v.skills || []).forEach(s => demandMap[s] = (demandMap[s] || 0) + 1));

    const sortedDemand = Object.entries(demandMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (!sortedDemand.length) return response("I don't have enough job data to determine skill demand trends yet.");

    return response("Top skills currently in demand based on active job openings:",
      sortedDemand.map(s => ({
        Skill: s[0].toUpperCase(),
        "Job Count": s[1],
        "Market Urgency": s[1] > 2 ? "🔥 High" : "✅ Moderate"
      })), "table");
  }

  // 7. PROFILE LOOKUP (By Name)
  const nameMatch = q.match(/who is\s+([\w\s]+)/i) || q.match(/profile\s+of\s+([\w\s]+)/i) || q.match(/info\s+on\s+([\w\s]+)/i);
  if (nameMatch) {
    const targetName = nameMatch[1].trim();
    const user = await User.findOne({ name: { $regex: new RegExp(targetName, "i") } });
    if (user) {
      return response(`Profile details for ${user.name}:`, [
        { Detail: "Designation", Information: user.designation || "Staff" },
        { Detail: "Email", Information: user.email },
        { Detail: "Phone", Information: user.phone || "Not provided" },
        { Detail: "Skills", Information: (user.skills || []).join(", ") || "None listed" },
        { Detail: "Status", Information: user.atsAnalyzed ? "ATS Screened" : "Pending Analysis" }
      ], "table");
    }
  }

  // 8. USERS / EMPLOYEES (Filtering - Lower priority)
  if (q.includes("user") || q.includes("employee") || q.includes("filter") || q.includes("skill")) {
    const skillMatch = q.match(/filter\s+(?:by\s+)?(\w+)/i) || q.match(/(\w+)\s+(?:skill|expert|developer)/i);
    let filter = {};
    let skillSubject = "";
    if (skillMatch) {
      skillSubject = skillMatch[1].toLowerCase();
      filter.skills = { $regex: new RegExp(skillSubject, "i") };
    }
    const users = await User.find(filter).limit(10);
    if (!users.length) return response(`No employees found matching your search.`);
    return response(`Employee Search Results:`, users.map(u => ({
      Name: u.name,
      Designation: u.designation || "Staff",
      Skills: (u.skills || []).slice(0, 3).join(", ")
    })), "table");
  }

  // 9. VACANCIES / JOBS
  if (q.includes("vacanc") || q.includes("job") || q.includes("openings")) {
    const locMatch = q.match(/in\s+([\w\s,]+)/i);
    let filter = { status: "Active" };
    if (locMatch) filter.location = { $regex: new RegExp(locMatch[1].trim(), "i") };
    const vacancies = await Vacancy.find(filter).limit(5);
    if (!vacancies.length) return response("No matching active vacancies found.");
    return response("Active Job Openings:", vacancies.map(v => ({
      Title: v.title,
      Location: v.location,
      Department: v.department,
      Experience: `${v.experienceMin}+ yrs`
    })), "table");
  }

  // DEFAULT
  return response("I'm not exactly sure how to help. Try: 'urgent jobs', 'skill demand', 'company overview', or 'filter by [skill]'.");
}

// ================= CHAT ENDPOINT =================
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });
    const result = await processQuery(message);
    res.json({ botResponse: result });
  } catch (err) {
    console.error("HR Chat Backend Error:", err);
    res.status(500).json({ error: "Sorry, I had trouble processing that request." });
  }
});

module.exports = router;