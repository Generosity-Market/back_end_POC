'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Preferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id"
        }
      },
      causeID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Causes",
          key: "id"
        }
      },
      orgID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Organizations",
          key: "id"
        }
      },
      whiteText: {
        type: Sequelize.BOOLEAN(true),
        allowNull: false
      },
      roundImage: {
        type: Sequelize.BOOLEAN(true),
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
    return queryInterface.dropTable('Preferences');
  }
};
