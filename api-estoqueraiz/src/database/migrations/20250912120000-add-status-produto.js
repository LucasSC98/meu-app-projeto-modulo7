// Exemplo: 20250912120000-add-status-produto.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("produtos", "statusProduto", {
      type: Sequelize.ENUM("pendente", "aprovado", "rejeitado"),
      allowNull: false,
      defaultValue: "pendente",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("produtos", "statusProduto");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_produtos_statusProduto";'
    );
  },
};
