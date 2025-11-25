"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Elimina la tabla de mensajes si existe
    await queryInterface.dropTable("mensaje", { cascade: true }).catch(() => {});
    // Elimina la tabla de chat si existe
    await queryInterface.dropTable("chat", { cascade: true }).catch(() => {});
    // Elimina la tabla de logs de chatbot si existe
    await queryInterface.dropTable("chatbot_log", { cascade: true }).catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    // No se recrean las tablas eliminadas
  },
};
