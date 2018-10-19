const { Donation, Comment} = require('../models/index');
const stripe = require('stripe')('sk_test_ASY8QP6OPakXsYJNmVFFD4Xu');

//-----------------------
//    Donations Routes
//-----------------------

// NOTES & TODOS
// This route will also add comments (if applicable)
// Should receive an array of cart items that were purchased

// We need to create the stripe customer
// ..then charge the card..
// ..then create an empty response object..
// ..then loop the the cart array and create a donation entry for each... Donation.create...
// ..with each of those responses, push them to the response object..
// ..send the response object back to the client side..
exports.createDonation = (req,res) => {
  const { cart, userID, causeID, amount, public_comment, private_comment, imageURL } = req.body;
  // console.log("Token: ", req.body.token); 

    // TODO add the customer to the stripe database before creating the charge
    stripe.customers.create({
      email: req.body.email,
      card: req.body.token.id
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
      console.log("Charge response: ", charge);
      // Do stuff our database here...
      // Then move the res.send to the returned promise it creates..
      // TODO loop through cart and create seperate donations here...
      if (charge.status === 'succeeded') {
        // Create object to add cart info for response?
        let response = [];
        cart.forEach(item => {
          let itemArgs = {
            amount: item.amount,
            userID: 1,
            causeID: item.causeID,
          }
          Donation.create(itemArgs)
          .then(donation => {
            response.push(donation);
          })
          .catch(err => {
            res.status('500').json(err);
          })
        })
        // res.status('201').send(charge);
        res.status('201').send(response);
      }
    })
    .catch(err => {
      console.log("Error:", err);
      res.status(500).send({ error: "Purchase Failed" });
    });

  // NOTE userID and amount will be used in both donation and comment functions
  // NOTE In the callback of the donation function, use the returned id as the donationID for the comment function.
};
