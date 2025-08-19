import express from "express";
import sequelize from "./config/database";
import rotaLogin from "./routes/rotaLogin";
import rotaUsuarios from "./routes/rotaUsuarios";
import rotaCategoria from "./routes/rotaCategoria";
import rotaUnidade from "./routes/rotaUnidade";
import rotaProdutos from "./routes/rotaProdutos";
import "./models/UnidadesModel";
import "./models/ProdutosModel";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Estoque Raiz",
      version: "1.0.0",
      description: "Documentação da API com Swagger",
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(express.json());
app.use("/usuarios", rotaUsuarios);
app.use(rotaLogin);
app.use("/categorias", rotaCategoria);
app.use("/unidades", rotaUnidade);
app.use("/produtos", rotaProdutos);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get("/", (req, res) => {
  res.send("Olá, mundo!");
});

async function iniciarAplicacao() {
  try {
    await sequelize.authenticate();
    console.log("Conexão com banco de dados estabelecida com sucesso!");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

    await sequelize.sync({ alter: true });
    console.log("Banco de dados sincronizado com sucesso!");
  } catch (error) {
    console.error("Erro ao iniciar aplicação:", error);
  }
}

iniciarAplicacao();
