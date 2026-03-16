const router = require("express").Router();
const { draftGrievance } = require("../controllers/grievanceController");

router.post("/", draftGrievance);

module.exports = router;
