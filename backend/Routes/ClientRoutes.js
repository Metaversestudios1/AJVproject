const {
  insertClient,
  updateClient,
  getAllClient,
  getSingleClient,
  deleteClient,
  clientlogin,
  getNextclientId,
} = require("../Controllers/ClientController");
const express = require("express");
const router = express.Router();

router.post("/insertClient", insertClient);
router.put("/updateClient", updateClient);
router.get("/getAllClient", getAllClient);
router.post("/getSingleClient", getSingleClient);
router.delete("/deleteClient", deleteClient);
router.get("/getNextclientId", getNextclientId);
router.post("/clientlogin", clientlogin);

module.exports = router;
