import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Produto from "./ProdutosModel";
import Usuario from "./UsuariosModel";
import Unidade from "./UnidadesModel";

class Movimentacao extends Model {
  public id!: number;
  public tipo!: "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE";
  public quantidade!: number;
  public data_movimentacao!: Date;
  public observacao?: string;
  public documento?: string;
  public produto_id!: number;
  public usuario_id!: number;
  public unidade_origem_id?: number;
  public unidade_destino_id?: number;
  public readonly criado_em!: Date;
  public readonly atualizado_em!: Date;
}

Movimentacao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM("ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"),
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data_movimentacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Produto, key: "id" },
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Usuario, key: "id" },
    },
    unidade_origem_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Unidade, key: "id" },
    },
    unidade_destino_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Unidade, key: "id" },
    },
  },
  {
    sequelize,
    modelName: "Movimentacao",
    tableName: "movimentacoes",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: "atualizado_em",
  }
);

Movimentacao.belongsTo(Produto, { foreignKey: "produto_id", as: "produto" });
Movimentacao.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });
Movimentacao.belongsTo(Unidade, {
  foreignKey: "unidade_origem_id",
  as: "unidade_origem",
});
Movimentacao.belongsTo(Unidade, {
  foreignKey: "unidade_destino_id",
  as: "unidade_destino",
});

export default Movimentacao;
