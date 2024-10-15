const {
  insertProperty,
  updateProperty,
  getAllProperty,
  getSingleProperty,
  deleteProperty,
} = require("../Controllers/PropertyController");
const express = require("express");
const router = express.Router();

router.post("/insertProperty", insertProperty);
router.put("/updateProperty", updateProperty);
router.get("/getAllProperty", getAllProperty);
router.post("/getSingleProperty", getSingleProperty);
router.delete("/deleteProperty", deleteProperty);

module.exports = router;
