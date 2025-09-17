import { Request, Response } from "express";
import MovimentacaoModel from "../models/MovimentacoesModel";
import ProdutoModel from "../models/ProdutosModel";
import CategoriaModel from "../models/CategoriasModel";
import UnidadeModel from "../models/UnidadesModel";
import UsuarioModel from "../models/UsuariosModel";
import { Op } from "sequelize";
import sequelize from "../config/database";
import {
  validarCamposObrigatorios,
  valorMaiorQueZero,
  validarExistenciasPorId,
} from "../utils/validacoes";

export async function criarMovimentacao(req: Request, res: Response) {
  const {
    tipo,
    quantidade,
    observacao,
    documento,
    produto_id,
    usuario_id,
    unidade_origem_id,
    unidade_destino_id,
  } = req.body;

  const usuarioId = usuario_id || req.usuarioId;

  // Validações iniciais
  const camposObrigatorios = ["tipo", "quantidade", "produto_id"];
  const camposFaltando = validarCamposObrigatorios(
    { tipo, quantidade, produto_id, usuario_id: usuarioId },
    camposObrigatorios
  );

  if (camposFaltando.length > 0) {
    return res.status(400).json({
      message: `Campos obrigatórios faltando: ${camposFaltando.join(", ")}`,
    });
  }

  if (!valorMaiorQueZero(quantidade)) {
    return res.status(400).json({
      message: "Quantidade deve ser maior que zero",
    });
  }

  const unidadeOrigemId = unidade_origem_id || req.usuario?.unidade_id;
  if (!unidadeOrigemId) {
    return res.status(400).json({
      message: "Unidade de origem não definida",
    });
  }

  // Validações específicas para TRANSFERENCIA
  if (tipo === "TRANSFERENCIA") {
    const camposTransferencia = ["unidade_destino_id"];
    const camposFaltandoTransferencia = validarCamposObrigatorios(
      { unidade_destino_id },
      camposTransferencia
    );
    if (camposFaltandoTransferencia.length > 0) {
      return res.status(400).json({
        message: `Para transferência, campos obrigatórios faltando: ${camposFaltandoTransferencia.join(
          ", "
        )}`,
      });
    }
    if (unidadeOrigemId === unidade_destino_id) {
      return res.status(400).json({
        message: "Unidade de origem deve ser diferente da de destino",
      });
    }
  }

  if (
    req.usuario?.cargo !== "gerente" &&
    req.unidadePermitida !== unidadeOrigemId
  ) {
    return res.status(403).json({
      message: "Acesso negado: você só pode movimentar produtos da sua unidade",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    // Verificar existência de produto, usuário e unidades
    const validacaoExistencia = await validarExistenciasPorId([
      { model: ProdutoModel, id: produto_id, nomeCampo: "Produto" },
      { model: UsuarioModel, id: usuarioId, nomeCampo: "Usuário" },
      {
        model: UnidadeModel,
        id: unidadeOrigemId,
        nomeCampo: "Unidade de origem",
      },
      ...(tipo === "TRANSFERENCIA" && unidade_destino_id
        ? [
            {
              model: UnidadeModel,
              id: unidade_destino_id,
              nomeCampo: "Unidade de destino",
            },
          ]
        : []),
    ]);

    if (!validacaoExistencia.valido) {
      await transaction.rollback();
      return res.status(404).json({ message: validacaoExistencia.mensagem });
    }

    const produto = await ProdutoModel.findByPk(produto_id, { transaction });
    if (!produto) {
      await transaction.rollback();
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    // Validações de negócio
    if (tipo === "SAIDA" && produto.quantidade_estoque < quantidade) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Quantidade insuficiente em estoque para saída",
        estoque_atual: produto.quantidade_estoque,
        quantidade_solicitada: quantidade,
      });
    }

    if (tipo === "TRANSFERENCIA") {
      if (produto.quantidade_estoque < quantidade) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Quantidade insuficiente em estoque para transferência",
          estoque_atual: produto.quantidade_estoque,
          quantidade_solicitada: quantidade,
        });
      }
    }

    const movimentacao = await MovimentacaoModel.create(
      {
        tipo,
        quantidade,
        observacao,
        documento,
        produto_id,
        usuario_id: usuarioId,
        unidade_origem_id: unidadeOrigemId,
        unidade_destino_id,
      },
      { transaction }
    );

    let novaQuantidade = produto.quantidade_estoque;

    switch (tipo) {
      case "ENTRADA":
        novaQuantidade += quantidade;
        break;
      case "SAIDA":
        novaQuantidade -= quantidade;
        break;
      case "AJUSTE":
        novaQuantidade = quantidade;
        break;
      case "TRANSFERENCIA":
        novaQuantidade -= quantidade;

        const produtoDestino = await ProdutoModel.findOne({
          where: {
            nome: produto.nome,
            unidade_id: unidade_destino_id,
            ativo: true,
          },
          transaction,
        });

        if (produtoDestino) {
          const novaQuantidadeDestino =
            produtoDestino.quantidade_estoque + quantidade;
          console.log("Atualizando produto existente:", {
            produto_id: produtoDestino.id,
            quantidade_atual: produtoDestino.quantidade_estoque,
            nova_quantidade: novaQuantidadeDestino,
          });

          await produtoDestino.update(
            {
              quantidade_estoque: novaQuantidadeDestino,
              ativo: true,
            },
            { transaction }
          );
        } else {
          await ProdutoModel.create(
            {
              nome: produto.nome,
              descricao: produto.descricao || null,
              codigo_barras: null,
              preco_custo: produto.preco_custo || 0,
              preco_venda: produto.preco_venda || 0,
              quantidade_estoque: quantidade,
              quantidade_minima: produto.quantidade_minima || 1,
              data_validade: produto.data_validade || null,
              lote: produto.lote || null,
              localizacao: produto.localizacao || null,
              imagem_url: produto.imagem_url || null,
              ativo: true,
              statusProduto: "pendente",
              categoria_id: produto.categoria_id,
              unidade_id: unidade_destino_id,
              usuario_id: usuarioId,
            },
            { transaction }
          );
        }
        break;
    }

    await produto.update(
      {
        quantidade_estoque: Math.max(0, novaQuantidade),
        ativo: Math.max(0, novaQuantidade) > 0,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Movimentação criada com sucesso",
      movimentacao,
      estoque_atualizado: Math.max(0, novaQuantidade),
    });
  } catch (error: unknown) {
    await transaction.rollback();
    console.error("Erro ao criar movimentação:", error);
    return res.status(500).json({
      message: "Erro ao criar movimentação",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

export async function buscarMovimentacoes(req: Request, res: Response) {
  const {
    produto_id,
    tipo,
    unidade_id,
    data_inicio,
    data_fim,
    page = 1,
    limit = 20,
  } = req.query;

  try {
    const whereClause: any = {};

    if (produto_id) whereClause.produto_id = produto_id;
    if (tipo) whereClause.tipo = tipo;

    if (req.unidadePermitida !== null) {
      whereClause[Op.or] = [
        { unidade_origem_id: req.unidadePermitida },
        { unidade_destino_id: req.unidadePermitida },
      ];
    } else if (unidade_id) {
      whereClause[Op.or] = [
        { unidade_origem_id: unidade_id },
        { unidade_destino_id: unidade_id },
      ];
    }

    if (data_inicio && data_fim) {
      whereClause.data_movimentacao = {
        [Op.between]: [data_inicio, data_fim],
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: movimentacoes } =
      await MovimentacaoModel.findAndCountAll({
        where: whereClause,
        include: [
          { model: ProdutoModel, as: "produto" },
          { model: UsuarioModel, as: "usuario" },
          { model: UnidadeModel, as: "unidade_origem" },
          { model: UnidadeModel, as: "unidade_destino" },
        ],
        order: [["data_movimentacao", "DESC"]],
        limit: Number(limit),
        offset,
      });

    return res.status(200).json({
      movimentacoes,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(count / Number(limit)),
        total_items: count,
        items_per_page: Number(limit),
      },
    });
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar movimentações",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function buscarMovimentacaoPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const movimentacao = await MovimentacaoModel.findByPk(id, {
      include: [
        {
          model: ProdutoModel,
          as: "produto",
          include: [{ model: CategoriaModel, as: "categoria" }],
        },
        { model: UsuarioModel, as: "usuario" },
        { model: UnidadeModel, as: "unidade_origem" },
        { model: UnidadeModel, as: "unidade_destino" },
      ],
    });

    if (!movimentacao) {
      return res.status(404).json({ message: "Movimentação não encontrada" });
    }

    return res.status(200).json(movimentacao);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar movimentação",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function relatorioMovimentacoesPorPeriodo(
  req: Request,
  res: Response
) {
  const { data_inicio, data_fim, unidade_id } = req.query;

  const camposObrigatorios = ["data_inicio", "data_fim"];
  const camposFaltando = validarCamposObrigatorios(
    { data_inicio, data_fim },
    camposObrigatorios
  );

  if (camposFaltando.length > 0) {
    return res.status(400).json({
      message: `Parâmetros obrigatórios faltando: ${camposFaltando.join(", ")}`,
    });
  }

  try {
    const whereClause: any = {
      data_movimentacao: {
        [Op.between]: [data_inicio, data_fim],
      },
    };

    if (unidade_id) {
      whereClause[Op.or] = [
        { unidade_origem_id: unidade_id },
        { unidade_destino_id: unidade_id },
      ];
    }

    const movimentacoes = await MovimentacaoModel.findAll({
      where: whereClause,
      include: [
        {
          model: ProdutoModel,
          as: "produto",
          include: [{ model: CategoriaModel, as: "categoria" }],
        },
        { model: UsuarioModel, as: "usuario" },
        { model: UnidadeModel, as: "unidade_origem" },
        { model: UnidadeModel, as: "unidade_destino" },
      ],
      order: [["data_movimentacao", "DESC"]],
    });

    const resumo = {
      ENTRADA: { quantidade: 0, itens: 0 },
      SAIDA: { quantidade: 0, itens: 0 },
      TRANSFERENCIA: { quantidade: 0, itens: 0 },
      AJUSTE: { quantidade: 0, itens: 0 },
    };

    movimentacoes.forEach((mov) => {
      resumo[mov.tipo].quantidade += mov.quantidade;
      resumo[mov.tipo].itens += 1;
    });

    return res.status(200).json({
      periodo: { data_inicio, data_fim },
      resumo,
      movimentacoes,
      total_movimentacoes: movimentacoes.length,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao gerar relatório de movimentações",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function buscarUsuariosComMovimentacoes(
  req: Request,
  res: Response
) {
  try {
    const [results] = await sequelize.query(`
      SELECT DISTINCT u.id, u.nome, u.email, u.cargo
      FROM usuarios u
      INNER JOIN movimentacoes m ON u.id = m.usuario_id
      ORDER BY u.nome ASC
    `);

    if (!results || results.length === 0) {
      const todosUsuarios = await UsuarioModel.findAll({
        attributes: ["id", "nome", "email", "cargo"],
        order: [["nome", "ASC"]],
      });
      return res.status(200).json(todosUsuarios);
    }

    return res.status(200).json(results);
  } catch (error: unknown) {
    console.error("Erro na query:", error);
    try {
      const todosUsuarios = await UsuarioModel.findAll({
        attributes: ["id", "nome", "email", "cargo"],
        order: [["nome", "ASC"]],
      });
      return res.status(200).json(todosUsuarios);
    } catch (fallbackError) {
      return res.status(500).json({
        message: "Erro ao buscar usuários",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
