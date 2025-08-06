import express from "express";
import sequelize from "./config/database";
import rotaUsuarios from "./rotas/rotaUsuarios";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/usuarios", rotaUsuarios);

app.get("/", (req, res) => {
  res.send("Olá, mundo!");
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("database foi sincronizado com sucesso");
  })
  .catch((error) => {
    console.log("deu zica no bagulho", error);
  });

async function iniciarAplicacao() {
  await sequelize.authenticate();
  app.listen(PORT, () => {
    console.log(`O servidor está rodando na porta ${PORT}`);
  });
}

iniciarAplicacao();
