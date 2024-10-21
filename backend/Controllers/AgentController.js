const Agent = require("../Models/AgentModel");
const Site = require("../Models/SiteModel");
const bcrypt = require("bcrypt");
const getNextAgentId = async (req, res) => {
  try {
    const lastAgent = await Agent.findOne().sort({ agent_id: -1 }).exec();
    console.log(lastAgent)
    if (!lastAgent) {
      return res.status(404).json({ success: true, agent_id: 100001 });
    }
    return res
      .status(404)
      .json({ success: true, agent_id: parseInt(lastAgent.agent_id) + 1 });
  } catch (err) {
    console.error("Error retrieving last agent id:", err);
    throw new Error("Could not retrieve agent id.");
  }
};

const insertAgent = async (req, res) => {
  try {


      if (match) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Password already taken for this agent ID.",
          });
      }
    }

    // Hash the password before saving
=======
>>>>>>> 7db8f8b04495c12d0470cca6603fe8a136ec0e05
    const hashedPassword = await bcrypt.hash(password, 10);
   
      if (match) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Password already taken for this agent ID.",
          });
      }
    }

    // Hash the password before saving
=======
>>>>>>> 7db8f8b04495c12d0470cca6603fe8a136ec0e05
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new agent
    const newAgent = new Agent(req.body);
    await newAgent.save();

    res
      .status(201)
      .json({ success: true, message: "Agent inserted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error inserting Agent",
      error: err.message,
    });
  }
};


const updateAgent = async (req, res) => {
  try {
    const { id, propertyIds, oldData } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Agent ID is required" });
    }

    // If propertyIds are present, it indicates the user is assigning properties
    if (propertyIds && Array.isArray(propertyIds)) {
      const result = await Agent.updateOne(
        { _id: id },
        { $set: { properties: propertyIds } }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Agent not found" });
      }

      return res.status(200).json({ success: true, message: "Properties assigned successfully", result });
    }

    // Otherwise, it is a general agent data update
    if (oldData) {
      const result = await Agent.updateOne(
        { _id: id },
        { $set: oldData }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Agent not found" });
      }

      return res.status(200).json({ success: true, message: "Agent updated successfully", result });
    }

    return res.status(400).json({ success: false, message: "Invalid request" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating the agent",
      error: err.message,
    });
  }
};


const getAllAgent = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const search = req.query.search;

    const query = {
      deleted_at: null,
    };
    if (search) {
      query.agentname = { $regex: search, $options: "i" };
    }

    const result = await Agent.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await Agent.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "error inserting Agent" });
  }
};
const getSingleAgent = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Agent.findOne({ _id: id });
    if (!result) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "error fetching Agent" });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Agent.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "error fetching Agent" });
  }
};

const agentlogin = async (req, res) => {
    const { agent_id, password } = req.body; // Include role in the destructuring
    try {
      // Check if all fields are provided
      if (!agent_id || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Please provide all fields" });
      }
  
      // Find the admin by email
      const agent = await Agent.findOne({ agent_id });
      if (!agent) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }
  
      // Compare the provided password with the stored hashed password
      const match = await bcrypt.compare(password, agent.password);
      if (!match) {
        return res
          .status(401)
          .json({ success: false, message: "Password does not match" });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: agent._id, username: agent.agentname }, // Include role in the token payload if needed
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      // Set cookie options
      const options = {
        expires: new Date(Date.now() + 2592000000), // 30 days
        httpOnly: true,
        sameSite: "None",
      };
  
      // Send response with token and admin details
      res.cookie("token", token, options).json({
        success: true,
        token,
        admin,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server error: " + err.message });
    }
  };
  
  const logout = async (req, res) => {
    res.clearCookie("connect.sid"); // Name of the session ID cookie
    res.clearCookie("token"); // Name of the session ID cookie
    res.status(200).json({ status: true, message: "Successfully logged out" });
  };

  const getAllAgentproperty = async (req, res) => {
    try {
      console.log(req.query.sid);
      const siteId = req.query.sid; // Property ID from the query parameter
  
      // Validate the site ID
      if (!siteId) {
        return res.status(400).json({ success: false, message: "Site ID is required." });
      }
  
       const site = await Site.findById(siteId);    
      
       if (!site) {
        return res.status(404).json({ success: false, message: "Site not found." });
      }  
      const propertyId = site.propertyId; // Assuming the property ID is stored as propertyId in SITE collection
      const query = {
        deleted_at: null,
        properties: { $in: [propertyId] } // Check if the properties array contains the specified property ID
      };
  
      // Fetch agents matching the query
      const result = await Agent.find(query);
      console.log(result);
      // Get the count of documents matching the query
      const count = await Agent.countDocuments(query);
      if (!result || result.length === 0) {
        return res.status(404).json({ success: false,count, message: "No agents found for the given property ID." });
      }
  
      
  
      // Send the response
      res.status(200).json({ success: true, result, count });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ success: false, message: "Error retrieving agents" });
    }
  };
  
  
// Usage within another function (like insertAgent

module.exports = {
  insertAgent,
  updateAgent,
  getAllAgent,
  getSingleAgent,
  deleteAgent,
  agentlogin,
  getAllAgentproperty,
  getNextAgentId
};
