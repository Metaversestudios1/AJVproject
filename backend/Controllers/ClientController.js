const Client = require('../Models/Client');
const bcrypt = require('bcrypt');
const insertClient = async (req, res) => {    
    try {
        
        const newClient = new Client(req.body);
        await newClient.save();
        res.status(201).json({ success: true })
    } catch (err) {
      res.status(500).json({ success: false, message: "Error inserting Client", error: err.message });
    }
  };

  const updateClient = async(req,res)=>{
    const updatedata = req.body;
    const id = updatedata.id;
    try{
        // console.log(updatedata.oldData)
     
        const result = await Client.updateOne(
            {_id:id},
            { $set :updatedata.oldData
            }
        );
        if(!result){
            res.status(404).json({success:false,message:"Client not found"});
        }
        res.status(201).json({ success: true, result: result });
    }catch(err){
        res.status(500).json({success:false,message:"error in updating the Client",error:err.message});

    }
  }



const getAllClient = async (req,res) => {
    try{
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

    }catch(error){
        res.status(500).json({success:false,message:"error inserting Client"});
     }
}
const getSingleClient = async(req, res) => {
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
}

const deleteClient = async(req, res) => {
    try{
        const { id } = req.body;
        const result = await Client.findByIdAndUpdate(
            id,
            { deleted_at:new Date()},
            { new: true}
        );
        if (!result) {
            return res.status(404).json({  success: false,message: "Client not found" });
          }
          res.status(200).json({
            success: true,
            data: result
          });
        
    } catch (error) {
        res.status(500).json({ success: false, message: "error fetching Client" });
    }
}  
module.exports= {
    insertClient,
    updateClient,
    getAllClient,
    getSingleClient,
    deleteClient,
  
}