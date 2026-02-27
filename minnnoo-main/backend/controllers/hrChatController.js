const User = require("../models/User");
const Vacancy = require("../models/Vacancy");

const hrChatController = async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // USERS
    if (lowerMsg.includes("how many users")) {
      const count = await User.countDocuments();
      return res.json({ reply: `There are ${count} registered users.` });
    }

    if (lowerMsg.includes("how many admins")) {
      const count = await User.countDocuments({ role: "admin" });
      return res.json({ reply: `There are ${count} admins.` });
    }

    if (lowerMsg.includes("recent users")) {
      const users = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email");

      return res.json({
        reply: "Here are the 5 most recent users:",
        data: users,
      });
    }

    // VACANCIES
    if (lowerMsg.includes("how many vacancies")) {
      const count = await Vacancy.countDocuments();
      return res.json({ reply: `There are ${count} total vacancies.` });
    }

    if (lowerMsg.includes("list vacancies")) {
      const vacancies = await Vacancy.find().select("title location");

      return res.json({
        reply: "Here are all vacancies:",
        data: vacancies,
      });
    }

    return res.json({
      reply: "Ask about users or vacancies.",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Something went wrong." });
  }
};

module.exports = { hrChatController };