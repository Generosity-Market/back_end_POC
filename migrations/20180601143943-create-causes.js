'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Causes', {
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
      orgID: {
        type: Sequelize.INTEGER,
        references: {
          model: "Organizations",
          key: "id"
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(5000),
        allowNull: false
      },
      purpose: {
        type: Sequelize.STRING,
        allowNull: false
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: false
      },
      featured: {
        type: Sequelize.BOOLEAN(false),
        allowNull: false
      },
      backgroundImage: {
        type: Sequelize.STRING
      },
      mainImage: {
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
    return queryInterface.dropTable('Causes');
  }
};
