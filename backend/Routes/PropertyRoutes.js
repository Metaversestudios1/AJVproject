const {
  insertProperty,
  updateProperty,
  getAllProperty,
  getSingleProperty,
  deleteProperty,
  getsinglePropertyID,
} = require("../Controllers/PropertyController");
const express = require("express");
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: (req, file, cb) => { 
    if (file.mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only certain files are allowed!'), false);
    }
  }
});

router.post("/insertProperty", upload.single('photo'), insertProperty);
router.put("/updateProperty", updateProperty);
router.get("/getAllProperty", getAllProperty);
router.post("/getSingleProperty", getSingleProperty);
router.delete("/deleteProperty", deleteProperty);
router.get('/getsinglePropertyID',getsinglePropertyID);

module.exports = router;
