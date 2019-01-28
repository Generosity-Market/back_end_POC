'use strict';
module.exports = (sequelize, DataTypes) => {
  var Preference = sequelize.define('Preference', {
    userID: DataTypes.INTEGER,
    causeID: DataTypes.INTEGER,
    orgID: DataTypes.INTEGER,
    whiteText: DataTypes.BOOLEAN,
    roundImage: DataTypes.BOOLEAN
  }, {});

  Preference.associate = function (models) {
    Preference.belongsTo(models.User, {
      as: "Users",
      foreignKey: "id"
    })
    Preference.belongsTo(models.Cause, {
      as: "Causes",
      foreignKey: "id"
    })
    Preference.belongsTo(models.Organization, {
      as: "Organizations",
      foreignKey: "id"
    })
  };

  return Preference;
};
