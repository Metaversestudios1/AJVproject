const Agent = require("../Models/AgentModel");
const bcrypt = require("bcrypt");
const getNextAgentId = async (req, res) => {
  try {
    const lastAgent = await Agent.findOne({deleted_at: null}).sort({ agent_id: -1 }).exec();

    if (!lastAgent) {
      return res.status(404).json({ success: true, agent_id: 100001 });
    }
    return res
      .status(404)
      .json({ success: true, agent_id: parseInt(lastAgent.agent_id) + 1 });
  } catch (err) {
    console.error("Error retrieving last agent id:", err);
    throw new Error("Could not retrieve rank id.");
  }
};
const insertAgent = async (req, res) => {
  try {
    const { password, ...data } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new agent
    const newAgent = new Agent({ ...data, password: hashedPassword });
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
    console.log(agent_id, password)
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
      console.log(match)
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


// Usage within another function (like insertAgent

module.exports = {
  insertAgent,
  updateAgent,
  getAllAgent,
  getSingleAgent,
  deleteAgent,
  agentlogin,
  getNextAgentId
};
