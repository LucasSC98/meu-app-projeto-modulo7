import bcrypt from "bcrypt";
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { validarCPF, validarEmail, validarSenha } from "../utils/validacoes";

class Usuario extends Model {
  public id!: number;
  public nome!: string;
  public email!: string;
  public senha!: string;
  public cpf!: string;
  public cargo!: string;
  public unidade_id!: number;

  public async verificarSenha(senha: string): Promise<boolean> {
    return bcrypt.compare(senha, this.senha);
  }

  public podeAcessarTodasUnidades(): boolean {
    return this.cargo === "gerente"; // Apenas gerente pode acessar todas as unidades
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
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        isValidEmail(value: string) {
          if (!validarEmail(value)) {
            throw new Error("Email inválido");
          }
        },
      },
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isValidCPF(value: string) {
          if (!validarCPF(value)) {
            throw new Error("CPF inválido");
          }
        },
      },
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isValidSenha(value: string) {
          if (!validarSenha(value)) {
            throw new Error("Senha inválida");
          }
        },
      },
    },
    cargo: {
      type: DataTypes.ENUM("gerente", "estoquista", "financeiro"),
      allowNull: false,
      defaultValue: "estoquista",
    },
    unidade_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Tornar obrigatório
      references: {
        model: "unidades",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    timestamps: false,
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

export default Usuario;
