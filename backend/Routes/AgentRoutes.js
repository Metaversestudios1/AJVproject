const {
  insertAgent,
  updateAgent,
  getAllAgent,
  getSingleAgent,
  deleteAgent,
  agentlogin,
  getAllAgentproperty,
  getNextAgentId
} = require("../Controllers/AgentController");
const express = require("express");
const router = express.Router();

router.post("/insertAgent", insertAgent);
router.put("/updateAgent", updateAgent);
router.get("/getAllAgent", getAllAgent);
router.post("/getSingleAgent", getSingleAgent);
router.delete("/deleteAgent", deleteAgent);
router.post("/agentlogin", agentlogin);
router.get("/getAllAgentproperty", getAllAgentproperty);
router.get("/getNextAgentId", getNextAgentId);




module.exports = router;
