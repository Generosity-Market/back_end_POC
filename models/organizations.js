'use strict';
module.exports = (sequelize, DataTypes) => {
  var Organization = sequelize.define('Organization', {
    userID: DataTypes.INTEGER,
    name: DataTypes.STRING,
    short_name: DataTypes.STRING,
    heading: DataTypes.STRING,
    mission: DataTypes.STRING,
    email: DataTypes.STRING,
    site_url: DataTypes.STRING,
    backgroundImage: DataTypes.STRING,
    mainImage: DataTypes.STRING
  }, {});

  Organization.associate = function(models) {
    Organization.belongsTo(models.User, {
      as: "Users",
      foreignKey: "userID"
    })
    Organization.hasMany(models.Preference, {
      as: "Preferences",
      foreignKey: "orgID"
    })
    Organization.hasMany(models.Cause, {
      as: "Causes",
      foreignKey: "orgID"
    })
  };

  return Organization;
};
