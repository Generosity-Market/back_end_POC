const { Donation, Comment} = require('../models/index');
const stripe = require('stripe')('sk_test_ASY8QP6OPakXsYJNmVFFD4Xu');

// This route will also add comments (if applicable)
// ...send the response object back to the client side for redux action...
exports.createDonation = (req,res) => {
  const { cart, userID, causeID, amount, public_comment, private_comment, imageURL, ...rest } = req.body;

    stripe.customers.create({
      email: rest.email,
      card: rest.token.id
    })
    .then(customer =>
      
      stripe.charges.create({
        amount: amount,
        description: `GenerosityMarket.co - ${cart[0].cause}`,
        currency: 'usd',
        customer: customer.id
      })
    )
    .then(charge => {
      // console.log("Charge response: ", charge);
      if (charge.status === 'succeeded') {
        // Create object to add cart info for response?
        let response = [];
        cart.forEach(item => {
          let itemArgs = {
            amount: item.amount,
            userID: 1,
            causeID: item.causeID,
            // stripeID: charge.id,
            // stripeCustomerID: charge.customer,
          }
          Donation.create(itemArgs)
          .then(donation => {
            response.push(donation);
          })
          .catch(err => {
            res.status('500').json(err);
          })
        })
        res.status('201').send({ status: 'Success', response, charge });
      }
    })
    .catch(err => {
      console.log("Error:", err);
      res.status(500).send({ error: "Purchase Failed" });
    });

  // NOTE userID and amount will be used in both donation and comment functions
  // NOTE In the callback of the donation function, use the returned id as the donationID for the comment function.
};
