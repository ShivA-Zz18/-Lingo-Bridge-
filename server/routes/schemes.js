const router = require("express").Router();
const { matchSchemes, getAllSchemes } = require("../controllers/schemeController");

router.post("/match", matchSchemes);
router.get("/", getAllSchemes);

module.exports = router;
