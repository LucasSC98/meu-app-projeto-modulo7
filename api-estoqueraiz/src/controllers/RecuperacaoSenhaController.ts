import e, { Request, Response } from "express";
import UsuarioModel from "../models/UsuariosModel";
import { enviarEmail } from "../utils/smtp";
import { gerarTokenRecuperacao } from "../utils/jwt";
import { verificarToken } from "../utils/jwt";

export const solicitarRecuperacaoSenha = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;
  const usuario = await UsuarioModel.findOne({ where: { email } });
  if (!usuario) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  const token = gerarTokenRecuperacao(usuario);

  await enviarEmail(
    email,
    "Recuperação de Senha",
    `Use este token para recuperar sua senha: ${token}`
  );

  return res
    .status(200)
    .json({ message: "Token de recuperação enviado para o e-mail" });
};

export const redefinirSenha = async (req: Request, res: Response) => {
  const { token, novaSenha } = req.body;
  try {
    const payload: any = verificarToken(token);
    const usuario = await UsuarioModel.findByPk(payload.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    await usuario.update({ senha: novaSenha });
    return res.status(200).json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    return res.status(400).json({ message: "Token inválido ou expirado" });
  }
};
