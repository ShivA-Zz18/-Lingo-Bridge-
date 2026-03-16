const router = require("express").Router();
const { upload, simplifyDocument, getHistory } = require("../controllers/simplifyController");

router.post("/", upload.single("image"), simplifyDocument);
router.get("/history", getHistory);

module.exports = router;
