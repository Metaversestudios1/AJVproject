const {
  insertNotification,
  updateNotification,
  getAllNotification,
  getSingleNotification,
  deleteNotification,
  deleteNotificationPhoto
} = require("../Controllers/NotificationController");
const express = require("express");
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only image files are allowed!'), false); // Reject the file
    }
  }
}).array('photos', 10);


router.post("/insertNotification",upload, insertNotification);
router.put("/updateNotification",upload, updateNotification);
router.get("/getAllNotification", getAllNotification);
router.post("/getSingleNotification", getSingleNotification);
router.delete("/deleteNotification", deleteNotification);
router.delete("/deleteNotificationPhoto", deleteNotificationPhoto);


module.exports = router;
