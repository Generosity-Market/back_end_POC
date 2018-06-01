'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Organizations', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      short_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      heading: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mission: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      site_url: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('Organizations');
  }
};
