'use strict';
module.exports = (sequelize, DataTypes) => {
  var Donation = sequelize.define('Donation', {
    userID: DataTypes.INTEGER,
    causeID: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    email: DataTypes.STRING,
    stripeID: DataTypes.STRING,
    stripeCustomerID: DataTypes.STRING
  }, {});

  Donation.associate = function(models) {
    Donation.belongsTo(models.Cause, {
      as: "Causes",
      foreignKey: "id"
    })
    
    Donation.belongsTo(models.User, {
      as: "Users",
      foreignKey: "id"
    })
    
    Donation.hasMany(models.Comment, {
      as: "Comments",
      foreignKey: "donationID"
    })

  };

  return Donation;
};
