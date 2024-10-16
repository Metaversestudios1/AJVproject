const Client = require("../Models/ClientModel");
const bcrypt = require("bcrypt");
const insertClient = async (req, res) => {
  console.log(req.body)
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error inserting Client",
        error: err.message,
      });
  }
};

const updateClient = async (req, res) => {
  const updatedata = req.body;
  const id = updatedata.id;
  try {
    // console.log(updatedata.oldData)

    const result = await Client.updateOne(
      { _id: id },
      { $set: updatedata.oldData }
    );
    if (!result) {
      res.status(404).json({ success: false, message: "Client not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "error in updating the Client",
        error: err.message,
      });
  }
};

const getAllClient = async (req, res) => {
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

    const result = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await Client.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "error inserting Client" });
  }
};
const getSingleClient = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Client.findOne({ _id: id });
    if (!result) {
      res.status(404).json({ success: false, message: "Client not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "error fetching Client" });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Client.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "error fetching Client" });
  }
};

const clientlogin = async (req, res) => {
    const { client_id, password } = req.body; // Include role in the destructuring
    try {
      // Check if all fields are provided
      if (!client_id || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Please provide all fields" });
      }
  
      // Find the admin by email
      const client = await Client.findOne({ client_id });
      if (!client) {
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
        { id: client._id, username: client.username }, // Include role in the token payload if needed
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
  
const getNextclientId = async (req,res) => {
    try {
      const lastclient = await Client.findOne().sort({ client_id: -1 }).exec();  
      if (!lastclient) {
          return res
          .status(404)
          .json({ success: true,agent_id:200001 });
      }
      return res
      .status(404)
      .json({ success: true,client_id:lastclient.client_id + 1});
     
    } catch (err) {
      // Handle any potential errors
      console.error("Error retrieving last client_id:", err);
      throw new Error("Could not retrieve Client ID.");
    }
  };
  
module.exports = {
  insertClient,
  updateClient,
  getAllClient,
  getSingleClient,
  deleteClient,
  getNextclientId,
  clientlogin
};
