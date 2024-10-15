const Agent = require("../Models/AgentModel");
const bcrypt = require("bcrypt");
const insertAgent = async (req, res) => {
  try {
    const newAgent = new Agent(req.body);
    await newAgent.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error inserting Agent",
        error: err.message,
      });
  }
};

const updateAgent = async (req, res) => {
  const updatedata = req.body;
  const id = updatedata.id;
  try {
    // console.log(updatedata.oldData)

    const result = await Agent.updateOne(
      { _id: id },
      { $set: updatedata.oldData }
    );
    if (!result) {
      res.status(404).json({ success: false, message: "Agent not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "error in updating the Agent",
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
      query.name = { $regex: search, $options: "i" };
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
      res.status(404).json({ success: false, message: "Agent not found" });
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
        { id: agent._id, username: agent.username }, // Include role in the token payload if needed
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
  const getNextAgentId = async (req,res) => {
  try {
    // Fetch the agent with the highest agent_id
    const lastAgent = await Agent.findOne().sort({ agent_id: -1 }).exec();

    // If no agent exists, return the first agent_id as 100001
    if (!lastAgent) {
        return res
        .status(404)
        .json({ success: true,agent_id:100001 });
    }
    return res
    .status(404)
    .json({ success: true,agent_id:lastAgent.agent_id + 1});
    // If agent exists, increment the last agent_id by 1
  } catch (err) {
    // Handle any potential errors
    console.error("Error retrieving last agent_id:", err);
    throw new Error("Could not retrieve agent ID.");
  }
};

// Usage within another function (like insertAgent

module.exports = {
  insertAgent,
  updateAgent,
  getAllAgent,
  getSingleAgent,
  deleteAgent,
  getNextAgentId,
  agentlogin
};
