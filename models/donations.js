'use strict';
module.exports = (sequelize, DataTypes) => {
  var Donation = sequelize.define('Donation', {
    userID: DataTypes.INTEGER,
    causeID: DataTypes.INTEGER,
    amount: DataTypes.INTEGER
  }, {});

  Donation.associate = function(models) {
    Donation.belongsTo(models.Cause, {
      as: "Causes",
      foreignKey: "causeID"
    })
    Donation.belongsTo(models.User, {
      as: "Users",
      foreignKey: "userID"
    })
  };

  return Donation;
};
