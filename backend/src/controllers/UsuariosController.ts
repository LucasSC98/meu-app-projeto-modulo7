import { Request, Response } from "express";
import UsuariosModel from "../models/UsuariosModel";
import { enviarEmail } from "../utils/smtp";

export const buscarTodosUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await UsuariosModel.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

export const buscarUsuarioPorId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const usuario = await UsuariosModel.findByPk(id);
    if (usuario) {
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  const dadosDoUsuario = {
    nome: req.body.nome,
    email: req.body.email,
    senha: req.body.senha,
    cpf: req.body.cpf,
  };
  try {
    const novoUsuario = await UsuariosModel.create(dadosDoUsuario);
    res.status(201).json(novoUsuario);
    await enviarEmail(
      novoUsuario.email,
      `Bem-vindo ao nosso serviço!`,
      `Olá ${novoUsuario.nome},\n\nObrigado por se cadastrar! você curte? `
    );
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};
