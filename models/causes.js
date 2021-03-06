'use strict';
module.exports = (sequelize, DataTypes) => {
  var Cause = sequelize.define('Cause', {
    userID:           DataTypes.INTEGER,
    orgID:            DataTypes.INTEGER,
    name:             DataTypes.STRING,
    type:             DataTypes.STRING,
    amount:           DataTypes.INTEGER,
    description:      DataTypes.STRING,
    purpose:          DataTypes.STRING,
    icon:             DataTypes.STRING,
    featured:         DataTypes.BOOLEAN,
    backgroundImage:  DataTypes.STRING,
    mainImage:        DataTypes.STRING
  }, {});

  Cause.associate = function(models) {
    Cause.belongsTo(models.User, {
      as: "Users",
      foreignKey: "id"
    })
    
    Cause.belongsTo(models.Organization, {
      as: "Organizations",
      foreignKey: "id"
    })
    
    Cause.hasMany(models.Preference, {
      as: "Preferences",
      foreignKey: "causeID"
    })
    
    Cause.hasMany(models.Donation, {
      as: "Donations",
      foreignKey: "causeID"
    })
    
  };

  return Cause;
};
