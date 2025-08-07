import { Request, Response } from "express";
import UsuariosModel from "../models/UsuariosModel";
import { enviarEmail } from "../utils/smtp";

export const buscarTodosUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await UsuariosModel.findAll();
    res.status(200).json(usuarios);
  } catch (error: any) {
    res.status(500).json("Erro ao buscar usuários" + error.message);
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
  } catch (error: any) {
    res.status(500).json("Erro ao buscar usuário " + error.message);
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
  } catch (error: any) {
    res.status(500).json("Erro ao criar usuário " + error.message);
  }
};

export const atualizarUsuário = async (
  req: Request<{ id: number }>,
  res: Response
) => {
  const dadosDoUsuario = {
    nome: req.body.nome,
    email: req.body.email,
    senha: req.body.senha,
    cpf: req.body.cpf,
  };
  try {
    if (dadosDoUsuario.nome.lenght < 3) {
      return res.status(400).json({
        error: "Usuário precisa ter mais de 3 caracteres em seu nome",
      });
    }

    const usuario = await UsuariosModel.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    usuario.nome = dadosDoUsuario.nome;
    usuario.email = dadosDoUsuario.email;
    usuario.senha = dadosDoUsuario.senha;
    usuario.cpf = dadosDoUsuario.cpf;

    await usuario.save();
    res.status(201).json(usuario);
  } catch (error: any) {
    res.status(500).json("Erro no servidor " + error.message);
  }
};
export const deletarUsuário = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const usuario = await UsuariosModel.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await usuario.destroy();

    res.status(204).send();
  } catch (error: any) {
    console.error(error);
    res.status(500).json("Problema no servidor " + error.message);
  }
};
