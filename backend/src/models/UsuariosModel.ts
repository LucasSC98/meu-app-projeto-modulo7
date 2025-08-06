import bcrypt from "bcrypt";
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { validarCPF, validarEmail } from "../utils/validacoes";

class Usuario extends Model {
  public id!: number;
  public nome!: string;
  public email!: string;
  public senha!: string;
  public cpf!: string;
  public async validarSenha(senha: string): Promise<boolean> {
    return bcrypt.compare(senha, this.senha);
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
