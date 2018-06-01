'use strict';
module.exports = (sequelize, DataTypes) => {
  var Comment = sequelize.define('Comment', {
    userID:          DataTypes.INTEGER,
    donationID:      DataTypes.INTEGER,
    imageURL:        DataTypes.STRING,
    amount:          DataTypes.INTEGER,
    public_comment:  DataTypes.STRING,
    private_comment: DataTypes.STRING
  }, {});

  Comment.associate = function(models) {
    Comment.belongsTo(models.User, {
      as: "Users",
      foreignKey: "id"
    })
    Comment.belongsTo(models.Donation, {
      as: "Donations",
      foreignKey: "id"
    })
  };

  return Comment;
};
