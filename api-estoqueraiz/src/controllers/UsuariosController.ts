import { Request, Response } from "express";
import UsuariosModel from "../models/UsuariosModel";
import { enviarEmail } from "../utils/smtp";
import sequelize from "../config/database";

interface AuthRequest extends Request {
  usuarioId?: number;
}

export const buscarTodosUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await UsuariosModel.findAll();
    return res.status(200).json(usuarios);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar usuários",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const buscarUsuarioPorId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const usuario = await UsuariosModel.findByPk(id);
    if (usuario) {
      return res.status(200).json(usuario);
    } else {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar usuário",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { nome, email, senha, cpf } = req.body;

    // Validações básicas
    if (!nome || !email || !senha || !cpf) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Campos obrigatórios: nome, email, senha, cpf",
      });
    }

    if (nome.length < 3) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Nome deve ter pelo menos 3 caracteres",
      });
    }

    // Verificar se email já existe
    const usuarioExistente = await UsuariosModel.findOne({ where: { email } });
    if (usuarioExistente) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Email já está em uso",
      });
    }

    const dadosDoUsuario = {
      nome,
      email,
      senha,
      cpf,
      cargo: "estoquista", // Cargo padrão
      unidade_id: 7, // Use uma unidade padrão que existe (vimos que você tem IDs 7-14)
    };

    const novoUsuario = await UsuariosModel.create(dadosDoUsuario, {
      transaction,
    });

    await transaction.commit();

    // Enviar email de boas-vindas (sem aguardar)
    enviarEmail(
      novoUsuario.email,
      `Bem-vindo ao Sistema Estoque Raiz - Agrológica`,
      `Olá ${novoUsuario.nome},\n\nSua conta foi criada com sucesso no sistema de estoque da Agrológica!\n\nCredenciais:\nEmail: ${email}\nSenha: ${senha}\n\nAcesse o sistema mobile.`
    ).catch(console.error);

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo,
        unidade_id: novoUsuario.unidade_id,
      },
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao criar usuário",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const atualizarUsuário = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { nome, email, senha, cpf } = req.body;

    if (nome && nome.length < 3) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Nome deve ter pelo menos 3 caracteres",
      });
    }

    const usuario = await UsuariosModel.findByPk(req.params.id);
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Atualizar apenas campos fornecidos
    const dadosAtualizacao: any = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (email) dadosAtualizacao.email = email;
    if (senha) dadosAtualizacao.senha = senha;
    if (cpf) dadosAtualizacao.cpf = cpf;

    await usuario.update(dadosAtualizacao, { transaction });
    await transaction.commit();

    return res.status(200).json({
      message: "Usuário atualizado com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        unidade_id: usuario.unidade_id,
      },
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao atualizar usuário",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deletarUsuário = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const transaction = await sequelize.transaction();

  try {
    const usuario = await UsuariosModel.findByPk(req.params.id);
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    await usuario.destroy({ transaction });
    await transaction.commit();

    return res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao deletar usuário",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
