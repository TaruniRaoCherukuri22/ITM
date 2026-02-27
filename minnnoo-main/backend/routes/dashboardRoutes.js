// // routes/dashboardRoutes.js
// const express = require("express");
// const router = express.Router();
// const { getDashboardVacancies } = require("../controllers/dashboardController");

// router.get("/dashboard", getDashboardVacancies);

// module.exports = router;



const express = require("express");
const router = express.Router();
// const { getDashboardVacancies } = require("../controllers/dashboardController");

router.get("/dashboard/:userId", getDashboardVacancies);

module.exports = router;
