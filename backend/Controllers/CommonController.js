const Agent = require("../Models/AgentModel");
const Notification = require("../Models/NotificationModel");
const Site = require("../Models/SiteModel");

const getAllSitesWithoutPagination = async (req, res) => {
  const sites = await Site.find();
  if (!sites) {
    return res
      .status(500)
      .json({ success: false, message: "Error in fetching" });
  }

  return res.status(201).json({ success: true, result: sites });
};
const getAllNotificationsWithoutPagination = async (req, res) => {
  const notification = await Notification.find();
  if (!notification) {
    return res
      .status(500)
      .json({ success: false, message: "Error in fetching" });
  }

  return res.status(201).json({ success: true, result: notification });
};
const getAllAgentsWithoutPagination = async (req, res) => {
  const agent = await Agent.find();
  if (!agent) {
    return res
      .status(201)
      .json({ success: false, message: "Error in fetching" });
  }
  return res.status(201).json({ success: true, result: agent });
};
const getSingleAgentCommisions = async (req, res) => {
  try {
    const { id, startDate, endDate } = req.query;

    // Parse startDate and endDate to JavaScript Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Add 1 day to make the end date inclusive

    const query = {
      _id: id,
      deleted_at: null,
    };

    // Fetch the agent document first
    const agent = await Agent.findOne(query).populate(
      "commissions.siteId",
      "propertyName"
    );

    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    // Filter commissions array based on the date range
    const filteredCommissions = agent.commissions.filter((commission) => {
      const commissionDate = new Date(commission.date);
      return commissionDate >= start && commissionDate < end;
    });

    // Return the filtered data
    res.status(200).json({
      success: true,
      result: { ...agent.toObject(), commissions: filteredCommissions },
    });
  } catch (error) {
    console.error("Error fetching agent commissions:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching data", error });
  }
};

const getSingleAgentSiteBookings = async (req, res) => {
  try {
    const { id, startDate, endDate } = req.query;

    // Convert startDate and endDate to JavaScript Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Make the end date inclusive

    // Query to find sites matching the agentId
    const sites = await Site.find({
      agentId: id,
      payments: {
        $elemMatch: {
          date: {
            $gte: start,
            $lt: end,
          },
        },
      },
    }).populate("propertyId", "propertyName"); // Populate to get the property name

    if (!sites.length) {
      return res.status(404).json({
        success: false,
        message: "No sites found for this agent within the given date range.",
      });
    }

    // Filter payments within each site to match the date range
    const filteredSites = sites.map((site) => {
      const filteredPayments = site.payments.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= start && paymentDate < end;
      });
      return { ...site.toObject(), payments: filteredPayments }; // Create a new site object with filtered payments
    });

    res.status(200).json({ success: true, result: filteredSites });
  } catch (error) {
    console.error("Error fetching sites by agent and date range:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching data", error });
  }
};

module.exports = {
  getAllAgentsWithoutPagination,
  getAllSitesWithoutPagination,
  getAllNotificationsWithoutPagination,
  getSingleAgentCommisions,
  getSingleAgentSiteBookings,
};
