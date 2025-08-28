"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("produtos", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      codigo_barras: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      preco_custo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      preco_venda: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      quantidade_estoque: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      quantidade_minima: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      data_validade: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lote: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      localizacao: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "categorias",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      unidade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "unidades",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("produtos", ["categoria_id"]);
    await queryInterface.addIndex("produtos", ["unidade_id"]);
    await queryInterface.addIndex("produtos", ["usuario_id"]);
    await queryInterface.addIndex("produtos", ["codigo_barras"]);
    await queryInterface.addIndex("produtos", ["ativo"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("produtos");
  },
};
