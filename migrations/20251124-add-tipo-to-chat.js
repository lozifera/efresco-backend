// Migration: Add 'tipo' column to 'chat' table
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chat', 'tipo', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'privado',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('chat', 'tipo');
  }
};

