'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Donations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // TODO add a stripe transaction id...for record keeping only. Don't need for client side
      // NOTE wont work in POC unless we drop tables and remigrate
      stripeID: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      stripeCustomerID: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // NOTE do we need the user to create a profile to be able to donate? If not then userID isn't needed...
      userID: {
        type: Sequelize.INTEGER,
        // allowNull: false,
        references: {
          model: "Users",
          key: "id"
        }
      },
      causeID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Causes",
          key: "id"
        }
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Donations');
  }
};
