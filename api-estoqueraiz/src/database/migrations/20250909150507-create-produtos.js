'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('produtos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        comment: "Localização física no estoque (ex: A1-B2-C3)",
      },
      imagem_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "URL da imagem do produto",
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
          model: 'categorias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      unidade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'unidades',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      criado_em: {
        allowNull: false,
        type: Sequelize.DATE
      },
      atualizado_em: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('produtos');
  }
};
