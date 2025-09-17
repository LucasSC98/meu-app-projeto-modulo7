import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Categoria from "./CategoriasModel";
import Unidade from "./UnidadesModel";
import Usuario from "./UsuariosModel";

class Produto extends Model {
  public id!: number;
  public nome!: string;
  public descricao?: string;
  public codigo_barras?: string;
  public preco_custo!: number;
  public preco_venda!: number;
  public quantidade_estoque!: number;
  public quantidade_minima!: number;
  public data_validade?: Date;
  public lote?: string;
  public localizacao?: string;
  public imagem_url?: string;
  public ativo!: boolean;
  public statusProduto!: "pendente" | "aprovado" | "rejeitado";
  public categoria_id!: number;
  public unidade_id!: number;
  public usuario_id!: number;

  public readonly criado_em!: Date;
  public readonly atualizado_em!: Date;
}

Produto.init(
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
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    codigo_barras: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    preco_custo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    preco_venda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    quantidade_estoque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quantidade_minima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    data_validade: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    localizacao: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Localização física no estoque (ex: A1-B2-C3)",
    },
    imagem_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "URL da imagem do produto",
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    statusProduto: {
      type: DataTypes.ENUM("pendente", "aprovado", "rejeitado"),
      allowNull: false,
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Categoria,
        key: "id",
      },
    },
    unidade_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Unidade,
        key: "id",
      },
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Produto",
    tableName: "produtos",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: "atualizado_em",
  }
);

Produto.belongsTo(Categoria, {
  foreignKey: "categoria_id",
  as: "categoria",
});

Produto.belongsTo(Unidade, {
  foreignKey: "unidade_id",
  as: "unidade",
});

Produto.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});

Categoria.hasMany(Produto, {
  foreignKey: "categoria_id",
  as: "produtos",
});

Unidade.hasMany(Produto, {
  foreignKey: "unidade_id",
  as: "produtos",
});

Usuario.hasMany(Produto, {
  foreignKey: "usuario_id",
  as: "produtos",
});

export default Produto;
