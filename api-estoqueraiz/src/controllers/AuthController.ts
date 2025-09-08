import { Request, Response } from "express";
import UsuariosModelo from "../models/UsuariosModel";
import UnidadesModel from "../models/UnidadesModel";
import { gerarToken as gerarJwt } from "../utils/jwt";
import bcrypt from "bcrypt";

const buscarUsuarioPorEmail = async (
  email: string
): Promise<UsuariosModelo | null> => {
  return await UsuariosModelo.findOne({ where: { email } });
};

const validarCredenciais = async (
  usuario: UsuariosModelo | null,
  senha: string
): Promise<boolean> => {
  if (!usuario) return false;
  return await usuario.verificarSenha(senha);
};

const formatarRespostaUsuario = (usuario: UsuariosModelo, token: string) => {
  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      unidade_id: usuario.unidade_id,
    },
  };
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email é obrigatório" });
      return;
    }

    if (!senha) {
      res.status(400).json({ message: "Senha é obrigatória" });
      return;
    }

    const usuario = await buscarUsuarioPorEmail(email);

    if (!usuario) {
      res.status(404).json({ message: "Email ou senha incorretos" });
      return;
    }

    const credenciaisValidas = await validarCredenciais(usuario, senha);

    if (!credenciaisValidas) {
      res.status(401).json({ message: "Email ou senha incorretos" });
      return;
    }

    const token = gerarJwt(usuario);
    const resposta = formatarRespostaUsuario(usuario, token);

    res.json(resposta);
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      message: "Erro interno do servidor. Tente novamente mais tarde.",
    });
  }
};
