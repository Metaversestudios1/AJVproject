const {
    getAllAgentsWithoutPagination,
    getAllSitesWithoutPagination,
    getSingleAgentCommisions,
    getSingleAgentSiteBookings,
    getAllNotificationsWithoutPagination

  } = require("../Controllers/CommonController");
  const express = require("express");
  const router = express.Router();

  router.get("/getAllSitesWithoutPagination", getAllSitesWithoutPagination);
  router.get("/getAllAgentsWithoutPagination", getAllAgentsWithoutPagination);
  router.get("/getSingleAgentCommisions", getSingleAgentCommisions);
  router.get("/getSingleAgentSiteBookings", getSingleAgentSiteBookings);
  router.get("/getAllNotificationsWithoutPagination", getAllNotificationsWithoutPagination);

  module.exports = router;
  