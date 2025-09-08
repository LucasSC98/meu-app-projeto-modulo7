'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('produtos', 'imagem_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'URL da imagem do produto'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('produtos', 'imagem_url');
  }
};
