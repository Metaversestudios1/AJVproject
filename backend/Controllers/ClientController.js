const Client = require("../Models/ClientModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const insertClient = async (req, res) => {
  try {
    const { password, ...data } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new agent
    const newClient = new Client({ ...data, password: hashedPassword });
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
      { $set: updatedata.data }
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
      query.clientname = { $regex: search, $options: "i" };
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
      return res.status(404).json({ success: false, message: "Client not found" });
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
  const { client_id, password } = req.body;
  try {
    if (!client_id || !password) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const client = await Client.findOne({ client_id });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client ID not found" });
    }

    const match = await bcrypt.compare(password, client.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: client._id, username: client.clientname },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { expiresIn: "30d", httpOnly: true, sameSite: "None" })
      .json({ success: true, token, user: client });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};
  
const getNextclientId = async (req,res) => {
    try {
      const lastclient = await Client.findOne({ deleted_at:null }).sort({ client_id: -1}).exec();  
      if (!lastclient) {
          return res
          .status(201)
          .json({ success: true,client_id:900001 });
      }
      return res
      .status(201)
      .json({ success: true,client_id:parseInt(lastclient.client_id) + 1});
     
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
