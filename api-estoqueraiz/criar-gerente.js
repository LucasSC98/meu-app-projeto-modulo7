require("dotenv").config();

async function criarGerente() {
  try {
    const sequelize = require("./src/config/database").default;
    await sequelize.authenticate();

    const UsuariosModel = require("./src/models/UsuariosModel").default;

    const gerente = await UsuariosModel.create({
      nome: "seu nome", // nome completo
      email: "s@seuemail.com", // deve ser um email válido e único
      senha: "Senha123", // a senha precisa ter no mínimo 6 caracteres
      cpf: "cpfvalido12", // deve ser um CPF válido
      status: "aprovado",
      cargo: "gerente",
      unidade_id: 1,
    });

    console.log(" Gerente criado com sucesso!");
    console.log("ID:", gerente.id);
    console.log("Email:", gerente.email);
  } catch (error) {
    console.error("Erro:", error.message);
  } finally {
    process.exit();
  }
}

criarGerente();
