import express from "express";
import cors from "cors";
import sequelize from "./config/database";
import rotaLogin from "./routes/rotaLogin";
import rotaUsuarios from "./routes/rotaUsuarios";
import rotaCategoria from "./routes/rotaCategoria";
import rotaUnidade from "./routes/rotaUnidade";
import rotaProdutos from "./routes/rotaProdutos";
import rotaMovimentacoes from "./routes/rotaMovimentacoes";
import rotaRecuperacao from "./routes/rotaRecuperacao";
import "./models/UnidadesModel";
import "./models/ProdutosModel";
import "./models/MovimentacoesModel";
import "./models/UsuariosModel";
import "./models/CategoriasModel";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { verificarToken } from "./middleware/AutenticacaoMiddleware";

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Estoque Raiz - Agrológica Agromercantil",
      version: "1.0.0",
      description: "Sistema WMS para controle de estoque de insumos agrícolas",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/", rotaLogin);
app.use("/usuarios", rotaUsuarios);
app.use("/categorias", verificarToken, rotaCategoria);
app.use("/unidades", verificarToken, rotaUnidade);
app.use("/produtos", verificarToken, rotaProdutos);
app.use("/movimentacoes", verificarToken, rotaMovimentacoes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api", rotaRecuperacao);

app.get("/", (req, res) => {
  res.json({
    message: "API Estoque Raiz - Agrológica Agromercantil",
    version: "1.0.0",
    endpoints: {
      docs: "/api-docs",
      usuarios: "/usuarios",
      categorias: "/categorias",
      unidades: "/unidades",
      produtos: "/produtos",
      movimentacoes: "/movimentacoes",
    },
  });
});

async function iniciarAplicacao() {
  try {
    await sequelize.authenticate();
    console.log("Conexão com banco de dados estabelecida com sucesso!");

    app.listen(PORT, () => {
      console.log(`Servidor está rodando na porta ${PORT}`);
      console.log(`Documentação da API: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Deu erro ao iniciar o servidor:", error);
  }
}

iniciarAplicacao();
