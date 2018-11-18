const { Donation, Comment} = require('../models/index');
const stripe = require('stripe')('sk_test_ASY8QP6OPakXsYJNmVFFD4Xu');

// This route will also add comments (if applicable)
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
      if (charge.status === 'succeeded') {

        let bulkDonations = cart.map(item => {
          return {
            amount: item.amount,
            userID: 1,
            causeID: item.causeID,
            // stripeID: charge.id,
            // stripeCustomerID: charge.customer,
          }
        });

        Donation.bulkCreate(bulkDonations)
        .then(data => res.status('201').json({ status: 'Success', response: data, charge }) )
        .catch(err => res.status(500).send({status: 'failed', err}))
      }
    })
    .catch(err => {
      res.status(500).send({ status: "failed", error: err });
    });

  // NOTE userID and amount will be used in both donation and comment functions
  // NOTE In the callback of the donation function, use the returned id as the donationID for the comment function.
};
