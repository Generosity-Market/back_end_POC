'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    name:             DataTypes.STRING,
    email:            DataTypes.STRING,
    street:           DataTypes.STRING,
    city:             DataTypes.STRING,
    state:            DataTypes.STRING,
    zipcode:          DataTypes.STRING,
    phone:            DataTypes.STRING,
    backgroundImage:  DataTypes.STRING,
    mainImage:        DataTypes.STRING
  }, {});

  User.associate = function(models) {
    User.hasMany(models.Preference, {
      as: "Preferences",
      foreignKey: "userID"
    })
    User.hasMany(models.Cause, {
      as: "Causes",
      foreignKey: "userID"
    })
    User.hasMany(models.Organization, {
      as: "Organizations",
      foreignKey: "userID"
    })
    User.hasMany(models.Comment, {
      as: "Comments",
      foreignKey: "userID"
    })
  };

  return User;
};
