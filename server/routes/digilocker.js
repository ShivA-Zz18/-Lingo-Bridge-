const router = require("express").Router();
const {
  authorize,
  callback,
  listDocuments,
  importDocument,
} = require("../controllers/digilockerController");

router.get("/auth", authorize);
router.get("/callback", callback);
router.get("/documents", listDocuments);
router.post("/import", importDocument);

module.exports = router;
