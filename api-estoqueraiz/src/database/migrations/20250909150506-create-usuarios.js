'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Nome é obrigatório' },
          len: { args: [3, 100], msg: 'Nome deve ter entre 3 e 100 caracteres' },
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Email inválido' },
          notEmpty: { msg: 'Email é obrigatório' },
        },
      },
      senha: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Senha é obrigatória' },
          len: { args: [6, 255], msg: 'Senha deve ter pelo menos 6 caracteres' },
        },
      },
      cpf: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'CPF é obrigatório' },
        },
      },
      status: {
        type: Sequelize.ENUM('pendente', 'aprovado', 'rejeitado'),
        allowNull: false,
        defaultValue: 'pendente',
      },
      cargo: {
        type: Sequelize.ENUM('gerente', 'estoquista', 'financeiro'),
        allowNull: true,
        defaultValue: null,
      },
      unidade_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'unidades',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};
