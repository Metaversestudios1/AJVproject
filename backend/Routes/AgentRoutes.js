const {
    insertAgent,
    updateAgent,
    getAllAgent,
    getSingleAgent,
    deleteAgent,
    getNextAgentId,
  agentlogin
} = require("../Controllers/AgentController");
const express = require("express");
const router = express.Router();

router.post("/insertAgent", insertAgent);
router.put("/updateAgent", updateAgent);
router.get("/getAllAgent", getAllAgent);
router.post("/getSingleAgent", getSingleAgent);
router.delete("/deleteAgent", deleteAgent);
router.get("/getNextAgentId", getNextAgentId);
router.post("/agentlogin", agentlogin);

module.exports = router;
