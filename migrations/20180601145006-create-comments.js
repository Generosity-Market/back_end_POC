'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
      imageURL: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      public_comment: {
        type: Sequelize.STRING
      },
      private_comment: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Comments');
  }
};
