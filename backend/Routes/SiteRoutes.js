const {
  insertSite,
  updateSite,
  getAllSite,
  getSingleSite,
  deleteSite,
} = require("../Controllers/SiteController");
const express = require("express");
const router = express.Router();

router.post("/insertSite", insertSite);
router.put("/updateSite", updateSite);
router.get("/getAllSite", getAllSite);
router.post("/getSingleSite", getSingleSite);
router.delete("/deleteSite", deleteSite);

module.exports = router;
