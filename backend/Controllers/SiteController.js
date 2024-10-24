const PropertyModel = require("../Models/PropertyModel");
const Site = require("../Models/SiteModel");
const Rank = require('../Models/RankModel');
const bcrypt = require("bcrypt");
const Agent =require('../Models/AgentModel')
// const insertSite = async (req, res) => {
//   try {
//     const newSite = new Site(req.body);
//     await newSite.save();
//     res.status(201).json({ success: true });
//   } catch (err) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error inserting Site",
//         error: err.message,
//       });
//   }
// };

const insertSite = async (req, res) => {
  try {
    const { propertyId } = req.body; // Assuming site_name is the unique identifier

    // Check if the site already exists
    const existingSite = await Site.findOne({ propertyId });

    if (existingSite) {
      // If the site exists, increment the visitCount
      existingSite.site_count += 1;
      await existingSite.save();

      return res.status(200).json({
        success: true,
        message: "Site visit count incremented",
        visitCount: existingSite.site_count,
      });
    } else {
      // If the site does not exist, create a new site with visitCount of 1
      const newSite = new Site({
        ...req.body,
        visitCount: 1, // Initialize visitCount to 1 for the new site
      });

      // Save the new site to the database
      await newSite.save();

      return res.status(201).json({
        success: true,
        siteId: newSite._id,
        site_count: newSite.site_count,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error inserting Site",
      error: err.message,
    });
  }
};

const updateSite = async (req, res) => {
  const updatedata = req.body;
  const id = updatedata.id;
  const paidAmount = updatedata.data.propertyDetails.amountPaid;
  const reaminingAmount = updatedata.data.propertyDetails.balanceRemaining;

  // Remove 'payments' from updatedata if it exists
  const { payments, ...restData } = updatedata.data;  // Exclude 'payments' field
  
  try {
    // First, update other fields except 'payments'
    const updateFields = await Site.updateOne(
      { _id: id },
      { $set: restData }  // Only update fields except 'payments'
    );

    if (updateFields.nModified === 0) {
      return res.status(404).json({ success: false, message: "No fields updated, or site not found" });
    }

    // Next, push the new payment to the 'payments' array
    const updatePayments = await Site.updateOne(
      { _id: id },
      { $push: { payments: { amount: paidAmount, date: new Date() } } }  // Push new payment
    );

    if (updatePayments.nModified === 0) {
      return res.status(404).json({ success: false, message: "Unable to update payments" });
    }
  
    const agentId = updatedata.data.agentId; // Get the agent ID associated with this site
console.log(agentId)
    // Step 3: Fetch the agent and their commission rate
    const agent = await Agent.findById(agentId).populate('rank'); // Assuming the rank has commissionRate
    console.log(agent);
    if (!agent || !agent.rank) {
      return res.status(404).json({ success: false, message: "Agent or rank not found" });
    }
    const commission = agent.rank.commissionRate;
    console.log(commission);
    const commissionRate = (commission / 100);
    console.log(commissionRate)
    const commissionDeduction = reaminingAmount * commissionRate;
    console.log(reaminingAmount);
    const updateAgent = await Agent.updateOne(
      { _id: agentId },
      {
        $push: {
          commissions: { 
            siteId: id, // Include the site ID for reference
            reaminingAmount:reaminingAmount,
            amount: commissionDeduction,
            date: new Date()
          }
        },
        // $inc: { totalCommission: -commissionDeduction } // Deduct from totalCommission
      }
    );

    if (updateAgent.nModified === 0) {
      return res.status(404).json({ success: false, message: "Unable to update agent's commission" });
    }

    res.status(201).json({ success: true, message: "Site updated successfully" });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error in updating the site",
      error: err.message,
    });
  }
};


// const updateSite = async (req, res) => {
//   const updatedata = req.body;
//   const id = updatedata.id;
//   const paidAmount = updatedata.data.propertyDetails.amountPaid;
//   console.log(paidAmount);
//   console.log(updatedata.data)
//   try {
//     const { ...restData } = updatedata.data; 
//     const result = await Site.updateOne(
//       { _id: id },
//       {
//         $set: restData, // Update other fields
//         $push: { payments: { amount: paidAmount, date: new Date() } } // Correctly add new payment to payments array
//    }
//     );

//     if (result.nModified === 0) {
//       // Check if no document was modified
//       return res.status(404).json({ success: false, message: "Site not found or no changes made" });
//     }
//     res.status(201).json({ success: true, result: result });
//   } catch (err) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "error in updating the Site",
//         error: err.message,
//       });
//   }
// };
// const updateSite = async (req, res) => {
//   // const { paymentId, total_payment, first_payment } = req.body; // Assume paymentId is sent in the request body
//   // const remaining_balance = total_payment - first_payment;
//   const updatedata = req.body;
//   //   const id = updatedata.id;
// console.log(req.body);
//   try {
//     // Update the existing payment document
//     const updatedPayment = await Payment.findByIdAndUpdate(
//       paymentId,
//       {
//         total_payment,
//         first_payment,
//         remaining_balance,
//         $push: {
//           payments: { amount: first_payment, date: new Date() }
//         }
//       },
//       { new: true, useFindAndModify: false } // Options to return the updated document
//     );

//     if (!updatedPayment) {
//       return res.status(404).json({ success: false, message: "Payment not found" });
//     }

//     res.json({ success: true, payment: updatedPayment });
//   } catch (err) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "error in updating the Site",
//         error: err.message,
//       });
//   }
// };

const getAllSite = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const id = req.query.id;
    const filter = req.query.filter;

    // Build query to match sites
    const query = {
      deleted_at: null, // Ensure we only match non-deleted sites
    };
    let sortCondition = { createdAt: -1 };
    if (filter === 'recent') {
      sortCondition = { createdAt: -1 }; // Descending order (newest first)
    } else if (filter === 'oldest') {
      sortCondition = { createdAt: 1 };  // Ascending order (oldest first)
    } else if (filter === 'Available') {
      query.status = 'Available'; // Filter by status 1
    } else if (filter === 'Booked') {
      query.status = 'Booked'; // Filter by status 0
    } else if (filter === 'Completed') {
      query.status = 'Completed'; // Filter by status 0
    }
    console.log
    if (id) {
      query.propertyId = id;
    }
    // If search string is provided, we search within the related property name
    if (search) {
      const properties = await PropertyModel.find({
        propertyname: { $regex: search, $options: "i" },
      }).select("_id"); // Only select property IDs

      // If properties are found, use their IDs in the query
      if (properties.length > 0) {
        const propertyIds = properties.map(property => property._id);
        query.propertyId = { $in: propertyIds };
      } else {
        // If no matching properties found, return empty result
        return res.status(200).json({ success: true, result: [], count: 0 });
      }
    }

    // Perform the site query with pagination
    const result = await Site.find(query)
      .populate('propertyId', 'propertyname') // Populate the propertyname
      .sort(sortCondition)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const count = await Site.find(query).countDocuments();

    res.status(200).json({ success: true, result, count });
  } catch (error) {
    console.error("Error fetching Sites:", error);  // Log the actual error
    res.status(500).json({ success: false, message: `Error fetching Sites: ${error.message}` });
  }
};

const getSingleSite = async (req, res) => {
  console.log(req.body);
  const { id } = req.body;
  try {
    const result = await Site.findOne({ _id: id });
    if (!result) {
      res.status(404).json({ success: false, message: "Site not found" });
    }
    const count = await Site.countDocuments({ site_name: result.propertyId });

    res.status(201).json({ success: true, result: result,count:count });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error fetching Site" });
  }
};

const deleteSite = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Site.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Site not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error fetching Site" });
  }
};
const updatesitestatus = async (req, res) => {
  try {
    console.log(res.body);
      const { id } = req.params
      const status = req.body.status;
      const Sitenew = await Site.findById(id);
      Sitenew.status = status;
      await Sitenew.save();
      res.status(200).json({ success: true });

  } catch (err) {
      res.status(500).json({ success: false, message: "error fetching transaction", error: err.message });

  }

}
module.exports = {
  insertSite,
  updateSite,
  getAllSite,
  getSingleSite,
  deleteSite,
  updatesitestatus
};
