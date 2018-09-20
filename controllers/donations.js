const models = require('../models/index');

//-----------------------
//    Donations Routes
//-----------------------

const { Donation, Comment } = models;

// NOTE WIP This route will also add comments (if applicable)
exports.createDonation = (req,res) => {
  const { userID, causeID, amount, public_comment, private_comment, imageURL } = req.body
  // NOTE userID and amount will be used in both donation and comment functions
  // NOTE In the callback of the donation function, use the returned id as the donationID for the comment function.
};
