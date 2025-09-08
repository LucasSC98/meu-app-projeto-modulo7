"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se a coluna cargo já existe
    const tableDescription = await queryInterface.describeTable("usuarios");

    if (!tableDescription.cargo) {
      // Adicionar a coluna cargo se não existir
      await queryInterface.addColumn("usuarios", "cargo", {
        type: Sequelize.ENUM("gerente", "estoquista", "financeiro"),
        allowNull: false,
        defaultValue: "estoquista",
      });
    }

    // Atualizar todos os usuários existentes que não tem cargo definido
    await queryInterface.sequelize.query(
      "UPDATE usuarios SET cargo = 'estoquista' WHERE cargo IS NULL"
    );
  },

  async down(queryInterface, Sequelize) {
    // Remover a coluna cargo
    await queryInterface.removeColumn("usuarios", "cargo");
  },
};
