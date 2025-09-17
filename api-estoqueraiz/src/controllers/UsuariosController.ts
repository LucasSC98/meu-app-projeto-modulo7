import { Request, Response } from "express";
import UsuariosModel from "../models/UsuariosModel";
import UnidadesModel from "../models/UnidadesModel";
import { enviarEmail } from "../utils/smtp";
import sequelize from "../config/database";
import {
  validarCamposObrigatorios,
  validarExistenciasPorId,
} from "../utils/validacoes";

interface AuthRequest extends Request {
  usuarioId?: number;
}

export const buscarTodosUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await UsuariosModel.findAll({
      include: [
        {
          model: UnidadesModel,
          as: "unidade",
        },
      ],
    });
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

    const camposObrigatorios = ["nome", "email", "senha", "cpf"];
    const camposFaltando = validarCamposObrigatorios(
      { nome, email, senha, cpf },
      camposObrigatorios
    );

    if (camposFaltando.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Campos obrigatórios faltando: ${camposFaltando.join(", ")}`,
      });
    }

    if (nome.length < 3) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Nome deve ter pelo menos 3 caracteres",
      });
    }

    const usuarioExistente = await UsuariosModel.findOne({ where: { email } });
    if (usuarioExistente) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Email já está em uso",
      });
    }

    const cpfExistente = await UsuariosModel.findOne({ where: { cpf } });
    if (cpfExistente) {
      await transaction.rollback();
      return res.status(400).json({
        message: "CPF já está em uso",
      });
    }

    const novoUsuario = await UsuariosModel.create(
      {
        nome,
        email,
        senha,
        cpf,
        status: "pendente",
        cargo: null,
        unidade_id: null,
      },
      { transaction }
    );

    await transaction.commit();

    enviarEmail(
      novoUsuario.email,
      "Bem-vindo ao Sistema Estoque Raiz - Agrológica",
      `Olá ${novoUsuario.nome},\n\nSua conta foi criada com sucesso no sistema de estoque da Agrológica!\n\nSua conta está aguardando aprovação do gerente. Você receberá uma notificação assim que for aprovado.\n\nEmail: ${email}\n\nAcesse o sistema mobile após aprovação.`
    ).catch(console.error);

    return res.status(201).json({
      message:
        "Usuário criado com sucesso. Conta aguardando aprovação do gerente.",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        status: novoUsuario.status,
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

export const listarUsuariosPendentes = async (req: Request, res: Response) => {
  try {
    if (req.usuario?.cargo !== "gerente") {
      return res.status(403).json({
        message:
          "Acesso negado: apenas gerentes podem visualizar usuários pendentes",
      });
    }

    const usuariosPendentes = await UsuariosModel.findAll({
      where: { status: "pendente" },
      attributes: ["id", "nome", "email", "cpf", "status"],
      order: [["nome", "ASC"]],
    });

    return res.status(200).json(usuariosPendentes);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao listar usuários pendentes",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const aprovarUsuario = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { cargo, unidade_id } = req.body;

    if (req.usuario?.cargo !== "gerente") {
      await transaction.rollback();
      return res.status(403).json({
        message: "Acesso negado: apenas gerentes podem aprovar usuários",
      });
    }

    const camposObrigatorios = ["cargo", "unidade_id"];
    const camposFaltando = validarCamposObrigatorios(
      { cargo, unidade_id },
      camposObrigatorios
    );

    if (camposFaltando.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Campos obrigatórios faltando: ${camposFaltando.join(", ")}`,
      });
    }

    if (!["estoquista", "financeiro"].includes(cargo)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Cargo deve ser estoquista ou financeiro",
      });
    }
    const validacaoExistencia = await validarExistenciasPorId([
      { model: UnidadesModel, id: unidade_id, nomeCampo: "Unidade" },
      { model: UsuariosModel, id: id, nomeCampo: "Usuário" },
    ]);

    if (!validacaoExistencia.valido) {
      await transaction.rollback();
      return res.status(404).json({ message: validacaoExistencia.mensagem });
    }

    const usuario = await UsuariosModel.findByPk(id);
    if (usuario?.status !== "pendente") {
      await transaction.rollback();
      return res.status(404).json({
        message: "Usuário pendente não encontrado",
      });
    }

    const unidade = await UnidadesModel.findByPk(unidade_id);

    await usuario.update(
      {
        status: "aprovado",
        cargo,
        unidade_id,
      },
      { transaction }
    );

    await transaction.commit();

    enviarEmail(
      usuario.email,
      "Conta Aprovada - Sistema Estoque Raiz",
      `Olá ${
        usuario.nome
      },\n\nSua conta foi aprovada pelo gerente!\n\nCargo: ${cargo}\nUnidade: ${
        unidade!.nome
      }\n\nAgora você pode acessar o sistema mobile.`
    ).catch(console.error);

    return res.status(200).json({
      message: "Usuário aprovado com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        unidade_id: usuario.unidade_id,
        status: usuario.status,
      },
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao aprovar usuário",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const atualizarUsuário = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { nome, email, senha, cpf } = req.body;

    const validacaoUsuario = await validarExistenciasPorId([
      { model: UsuariosModel, id: id, nomeCampo: "Usuário" },
    ]);

    if (!validacaoUsuario.valido) {
      await transaction.rollback();
      return res.status(404).json({ message: validacaoUsuario.mensagem });
    }

    const usuario = await UsuariosModel.findByPk(id);
    if (nome && nome.length < 3) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Nome deve ter pelo menos 3 caracteres",
      });
    }

    if (email && email !== usuario!.email) {
      const usuarioExistente = await UsuariosModel.findOne({
        where: { email },
      });
      if (usuarioExistente) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Email já está em uso",
        });
      }
    }

    if (cpf && cpf !== usuario!.cpf) {
      const cpfExistente = await UsuariosModel.findOne({ where: { cpf } });
      if (cpfExistente) {
        await transaction.rollback();
        return res.status(400).json({
          message: "CPF já está em uso",
        });
      }
    }

    const dadosAtualizacao: any = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (email) dadosAtualizacao.email = email;
    if (cpf) dadosAtualizacao.cpf = cpf;
    if (senha) dadosAtualizacao.senha = senha;

    await usuario!.update(dadosAtualizacao, { transaction });

    await transaction.commit();

    return res.status(200).json({
      message: "Usuário atualizado com sucesso",
      usuario: {
        id: usuario!.id,
        nome: usuario!.nome,
        email: usuario!.email,
        cpf: usuario!.cpf,
        status: usuario!.status,
        cargo: usuario!.cargo,
        unidade_id: usuario!.unidade_id,
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

export const deletarUsuário = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const validacaoUsuario = await validarExistenciasPorId([
      { model: UsuariosModel, id: id, nomeCampo: "Usuário" },
    ]);

    if (!validacaoUsuario.valido) {
      await transaction.rollback();
      return res.status(404).json({ message: validacaoUsuario.mensagem });
    }

    const usuario = await UsuariosModel.findByPk(id);

    await usuario!.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      message: "Usuário deletado com sucesso",
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao deletar usuário",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const rejeitarUsuario = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (req.usuario?.cargo !== "gerente") {
      await transaction.rollback();
      return res.status(403).json({
        message: "Acesso negado: apenas gerentes podem rejeitar usuários",
      });
    }
    const validacaoUsuario = await validarExistenciasPorId([
      { model: UsuariosModel, id: id, nomeCampo: "Usuário" },
    ]);

    if (!validacaoUsuario.valido) {
      await transaction.rollback();
      return res.status(404).json({ message: validacaoUsuario.mensagem });
    }

    const usuario = await UsuariosModel.findByPk(id);
    if (usuario?.status !== "pendente") {
      await transaction.rollback();
      return res.status(404).json({
        message: "Usuário pendente não encontrado",
      });
    }

    await usuario.update({ status: "rejeitado" }, { transaction });

    await transaction.commit();
    enviarEmail(
      usuario.email,
      "Conta Rejeitada - Sistema Estoque Raiz",
      `Olá ${usuario.nome},\n\nInfelizmente, sua conta foi rejeitada pelo gerente.\n\nEntre em contato para mais informações.`
    ).catch(console.error);

    return res.status(200).json({
      message: "Usuário rejeitado com sucesso",
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao rejeitar usuário",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const alterarCargoUsuario = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { cargo } = req.body;

    if (req.usuario?.cargo !== "gerente") {
      await transaction.rollback();
      return res.status(403).json({
        message: "Acesso negado: apenas gerentes podem alterar cargos",
      });
    }
    const camposObrigatorios = ["cargo"];
    const camposFaltando = validarCamposObrigatorios(
      { cargo },
      camposObrigatorios
    );

    if (camposFaltando.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Campos obrigatórios faltando: ${camposFaltando.join(", ")}`,
      });
    }

    if (!["gerente", "estoquista", "financeiro"].includes(cargo)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Cargo deve ser gerente, estoquista ou financeiro",
      });
    }

    const validacaoUsuario = await validarExistenciasPorId([
      { model: UsuariosModel, id: id, nomeCampo: "Usuário" },
    ]);

    if (!validacaoUsuario.valido) {
      await transaction.rollback();
      return res.status(404).json({ message: validacaoUsuario.mensagem });
    }

    const usuario = await UsuariosModel.findByPk(id);
    if (usuario?.status !== "aprovado") {
      await transaction.rollback();
      return res.status(404).json({
        message: "Usuário aprovado não encontrado",
      });
    }

    if (req.usuario?.id === usuario.id && cargo !== "gerente") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Não é possível alterar seu próprio cargo para não-gerente",
      });
    }

    const cargoAntigo = usuario.cargo;
    await usuario.update(
      {
        cargo,
      },
      { transaction }
    );

    await transaction.commit();
    enviarEmail(
      usuario.email,
      "Cargo Alterado - Sistema Estoque Raiz",
      `Olá ${usuario.nome},\n\nSeu cargo foi alterado no sistema!\n\nCargo anterior: ${cargoAntigo}\nNovo cargo: ${cargo}\n\nAs alterações já estão ativas.`
    ).catch(console.error);

    return res.status(200).json({
      message: "Cargo alterado com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        unidade_id: usuario.unidade_id,
        status: usuario.status,
      },
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao alterar cargo do usuário",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
