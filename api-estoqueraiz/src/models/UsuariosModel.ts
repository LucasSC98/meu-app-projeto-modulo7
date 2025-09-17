import bcrypt from "bcrypt";
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import UnidadesModel from "./UnidadesModel";
import { validarCPF, validarEmail, validarSenha } from "../utils/validacoes";

class Usuario extends Model {
  public id!: number;
  public nome!: string;
  public email!: string;
  public senha!: string;
  public cpf!: string;
  public status!: "pendente" | "aprovado" | "rejeitado";
  public cargo!: "gerente" | "estoquista" | "financeiro" | null;
  public unidade_id!: number | null;

  public async verificarSenha(senha: string): Promise<boolean> {
    return bcrypt.compare(senha, this.senha);
  }

  public podeAcessarTodasUnidades(): boolean {
    return this.cargo === "gerente";
  }

  public estaAprovado(): boolean {
    return this.status === "aprovado";
  }

  public toJSON(): object {
    const values = Object.assign({}, this.get());
    delete values.senha;
    return values;
  }
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Nome é obrigatório" },
        len: { args: [3, 100], msg: "Nome deve ter entre 3 e 100 caracteres" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Email é obrigatório" },
        isValidEmail(value: string) {
          if (!validarEmail(value)) {
            throw new Error(
              "Email inválido, exemplo de email a ser usado: usuario@gmail.com"
            );
          }
        },
      },
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Senha é obrigatória" },
        isValidSenha(value: string) {
          if (!validarSenha(value)) {
            throw new Error(
              "Senha deve ter pelo menos 6 caracteres, incluindo uma letra maiúscula e um número"
            );
          }
        },
      },
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "CPF é obrigatório" },
        isValidCPF(value: string) {
          if (!validarCPF(value)) {
            throw new Error("CPF inválido");
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM("pendente", "aprovado", "rejeitado"),
      allowNull: false,
      defaultValue: "pendente",
    },
    cargo: {
      type: DataTypes.ENUM("gerente", "estoquista", "financeiro"),
      allowNull: true,
      defaultValue: null,
    },
    unidade_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "unidades",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    timestamps: false, // Ajuste se usar timestamps
    hooks: {
      beforeCreate: async (usuario: Usuario) => {
        if (usuario.senha && !usuario.senha.startsWith("$2b$")) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      },
      beforeUpdate: async (usuario: Usuario) => {
        if (usuario.changed("senha")) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      },
    },
  }
);

// Relacionamentos
Usuario.belongsTo(UnidadesModel, {
  foreignKey: "unidade_id",
  as: "unidade",
});

export default Usuario;
