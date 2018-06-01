'use strict';
module.exports = (sequelize, DataTypes) => {
  var Comment = sequelize.define('Comment', {
    userID:   DataTypes.INTEGER,
    causeID:  DataTypes.INTEGER,
    imageURL: DataTypes.STRING,
    amount:   DataTypes.INTEGER,
    comment:  DataTypes.STRING
  }, {});

  Comment.associate = function(models) {
    Comment.belongsTo(models.User, {
      as: "Users",
      foreignKey: "userId"
    })
    Comment.belongsTo(models.Cause, {
      as: "Causes",
      foreignKey: "causeId"
    })
  };

  return Comment;
};
