import { Request, Response } from "express";
import ProdutoModel from "../models/ProdutosModel";
import CategoriaModel from "../models/CategoriasModel";
import UnidadeModel from "../models/UnidadesModel";
import UsuarioModel from "../models/UsuariosModel";
import MovimentacaoModel from "../models/MovimentacoesModel";
import sequelize from "../config/database";
import { validarUnidadeAcesso } from "../middleware/VerificacaoUnidadeMiddleware";
import {
  valorPositivo,
  valorMaiorQueZero,
  validarExistenciasPorId,
  validarCamposObrigatorios,
} from "../utils/validacoes";

export async function buscarTodosProdutos(req: Request, res: Response) {
  try {
    const whereClause: any = { ativo: true };

    if (req.unidadePermitida !== null) {
      whereClause.unidade_id = req.unidadePermitida;
    }

    const produtos = await ProdutoModel.findAll({
      where: whereClause,
      include: [
        { model: CategoriaModel, as: "categoria" },
        { model: UnidadeModel, as: "unidade" },
        { model: UsuarioModel, as: "usuario" },
      ],
    });
    return res.status(200).json(produtos);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar produtos",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function buscarProdutoPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const produto = await ProdutoModel.findByPk(id, {
      include: [
        { model: CategoriaModel, as: "categoria" },
        { model: UnidadeModel, as: "unidade" },
        { model: UsuarioModel, as: "usuario" },
      ],
    });

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    if (!validarUnidadeAcesso(produto.unidade_id, req)) {
      return res.status(403).json({
        message:
          "Acesso negado: você não tem permissão para acessar este produto",
      });
    }

    return res.status(200).json(produto);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar produto",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function criarProduto(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const {
      nome,
      descricao,
      codigo_barras,
      preco_custo,
      preco_venda,
      quantidade_estoque,
      quantidade_minima,
      data_validade,
      lote,
      localizacao,
      imagem_url,
      categoria_id,
      unidade_id,
      usuario_id,
    } = req.body;

    // Validação de unidade de acesso
    if (!validarUnidadeAcesso(unidade_id, req)) {
      await transaction.rollback();
      return res.status(403).json({
        message:
          "Acesso negado: você não pode cadastrar produtos nesta unidade",
      });
    }

    // Campos obrigatórios base
    const camposObrigatoriosBase = [
      "nome",
      "categoria_id",
      "unidade_id",
      "usuario_id",
    ];
    const camposFaltandoBase = validarCamposObrigatorios(
      req.body,
      camposObrigatoriosBase
    );
    if (camposFaltandoBase.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Campos obrigatórios faltando: ${camposFaltandoBase.join(
          ", "
        )}`,
      });
    }

    // Validações de valores positivos (apenas se fornecidos)
    if (preco_custo !== undefined && !valorPositivo(preco_custo)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Preço de custo deve ser positivo",
      });
    }
    if (preco_venda !== undefined && !valorPositivo(preco_venda)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Preço de venda deve ser positivo",
      });
    }
    if (
      quantidade_estoque !== undefined &&
      !valorMaiorQueZero(quantidade_estoque)
    ) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Quantidade em estoque deve ser maior que zero",
      });
    }
    if (
      quantidade_minima !== undefined &&
      !valorMaiorQueZero(quantidade_minima)
    ) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Quantidade mínima deve ser maior que zero",
      });
    }

    // Validação de existência
    const validacaoExistencia = await validarExistenciasPorId([
      { model: CategoriaModel, id: categoria_id, nomeCampo: "Categoria" },
      { model: UsuarioModel, id: usuario_id, nomeCampo: "Usuário" },
    ]);
    if (!validacaoExistencia.valido) {
      await transaction.rollback();
      return res.status(400).json({ message: validacaoExistencia.mensagem });
    }

    // Define status baseado nos preços
    const statusProduto = preco_custo && preco_venda ? "aprovado" : "pendente";

    const produto = await ProdutoModel.create(
      {
        nome,
        descricao,
        codigo_barras,
        preco_custo: preco_custo || 0.0,
        preco_venda: preco_venda || 0.0,
        quantidade_estoque: quantidade_estoque || 0,
        quantidade_minima: quantidade_minima || 1,
        data_validade,
        lote,
        localizacao,
        imagem_url,
        categoria_id,
        unidade_id,
        usuario_id,
        ativo: (quantidade_estoque || 0) > 0,
        statusProduto,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(201).json({
      message: "Produto criado com sucesso",
      produto,
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao criar produto",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function atualizarProduto(req: Request, res: Response) {
  const { id } = req.params;
  const {
    nome,
    descricao,
    codigo_barras,
    preco_custo,
    preco_venda,
    quantidade_estoque,
    quantidade_minima,
    data_validade,
    lote,
    localizacao,
    imagem_url,
    categoria_id,
    unidade_id,
    ativo,
  } = req.body;

  try {
    const produto = await ProdutoModel.findByPk(id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (!validarUnidadeAcesso(produto.unidade_id, req)) {
      return res.status(403).json({
        message: "Acesso negado: você não pode atualizar este produto",
      });
    }

    if (unidade_id && unidade_id !== produto.unidade_id) {
      if (!validarUnidadeAcesso(unidade_id, req)) {
        return res.status(403).json({
          message:
            "Acesso negado: você não tem permissão para mover este produto para outra unidade",
        });
      }
    }

    // Validação condicional: só validar campos fornecidos
    const camposParaValidar = [];
    if (categoria_id !== undefined && categoria_id !== null) {
      camposParaValidar.push({
        model: CategoriaModel,
        id: categoria_id,
        nomeCampo: "Categoria",
      });
    }
    // Sempre validar usuário (não editável via req.body)
    camposParaValidar.push({
      model: UsuarioModel,
      id: produto.usuario_id,
      nomeCampo: "Usuário",
    });

    if (camposParaValidar.length > 0) {
      const validacaoIds = await validarExistenciasPorId(camposParaValidar);
      if (!validacaoIds.valido) {
        return res.status(400).json({
          message: validacaoIds.mensagem,
        });
      }
    }

    // Determinar o novo statusProduto: se preços forem fornecidos e o produto for "pendente", alterar para "aprovado"
    let novoStatusProduto = produto.statusProduto;
    if (
      preco_custo !== undefined &&
      preco_venda !== undefined &&
      produto.statusProduto === "pendente"
    ) {
      novoStatusProduto = "aprovado";
    }

    await produto.update({
      nome,
      descricao,
      codigo_barras,
      preco_custo,
      preco_venda,
      quantidade_estoque,
      quantidade_minima,
      data_validade,
      lote,
      localizacao,
      imagem_url,
      categoria_id:
        categoria_id !== undefined ? categoria_id : produto.categoria_id, // Usar valor existente se não fornecido
      unidade_id: unidade_id !== undefined ? unidade_id : produto.unidade_id,
      ativo:
        quantidade_estoque !== undefined
          ? quantidade_estoque > 0
          : produto.ativo,
      statusProduto: novoStatusProduto,
    });

    return res
      .status(200)
      .json({ message: "Produto atualizado com sucesso", produto });
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao atualizar produto",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function deletarProduto(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const produto = await ProdutoModel.findByPk(id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (!validarUnidadeAcesso(produto.unidade_id, req)) {
      return res.status(403).json({
        message: "Acesso negado: você não pode deletar este produto",
      });
    }

    await produto.update({ ativo: false });

    return res.status(200).json({ message: "Produto desativado com sucesso" });
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao deletar produto",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function buscarProdutosPorCategoria(req: Request, res: Response) {
  const { categoria_id } = req.params;

  try {
    const whereClause: any = { categoria_id, ativo: true };

    if (req.unidadePermitida !== null) {
      whereClause.unidade_id = req.unidadePermitida;
    }

    const produtos = await ProdutoModel.findAll({
      where: whereClause,
      include: [
        { model: CategoriaModel, as: "categoria" },
        { model: UnidadeModel, as: "unidade" },
        { model: UsuarioModel, as: "usuario" },
      ],
    });

    return res.status(200).json(produtos);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar produtos por categoria",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function buscarProdutosPorUnidade(req: Request, res: Response) {
  const { unidade_id } = req.params;
  const unidadeIdNum = parseInt(unidade_id);

  if (!validarUnidadeAcesso(unidadeIdNum, req)) {
    return res.status(403).json({
      message:
        "Acesso negado: você não tem permissão para acessar esta unidade",
    });
  }

  try {
    const produtos = await ProdutoModel.findAll({
      where: { unidade_id: unidadeIdNum, ativo: true },
      include: [
        { model: CategoriaModel, as: "categoria" },
        { model: UnidadeModel, as: "unidade" },
        { model: UsuarioModel, as: "usuario" },
      ],
    });

    return res.status(200).json(produtos);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar produtos por unidade",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function buscarProdutosEstoqueBaixo(req: Request, res: Response) {
  try {
    const whereClause: any = { ativo: true };

    if (req.unidadePermitida !== null) {
      whereClause.unidade_id = req.unidadePermitida;
    }

    const produtos = await ProdutoModel.findAll({
      where: whereClause,
      include: [
        { model: CategoriaModel, as: "categoria" },
        { model: UnidadeModel, as: "unidade" },
        { model: UsuarioModel, as: "usuario" },
      ],
    });

    const produtosEstoqueBaixo = produtos.filter(
      (produto) => produto.quantidade_estoque <= produto.quantidade_minima
    );

    return res.status(200).json(produtosEstoqueBaixo);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar produtos com estoque baixo",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function entradaEstoque(req: Request, res: Response) {
  const { id } = req.params;
  const { quantidade, observacao, documento, usuario_id } = req.body;

  if (!quantidade || !usuario_id) {
    return res.status(400).json({
      message: "Quantidade e usuario_id são obrigatórios",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const produto = await ProdutoModel.findByPk(id);
    if (!produto) {
      await transaction.rollback();
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (!validarUnidadeAcesso(produto.unidade_id, req)) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Acesso negado: você não pode fazer entrada nesta unidade",
      });
    }
    await MovimentacaoModel.create(
      {
        tipo: "ENTRADA",
        quantidade,
        observacao,
        documento,
        produto_id: id,
        usuario_id,
      },
      { transaction }
    );

    const novaQuantidade = produto.quantidade_estoque + quantidade;
    await produto.update(
      {
        quantidade_estoque: novaQuantidade,
        ativo: novaQuantidade > 0,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      message: "Entrada de estoque realizada com sucesso",
      produto: {
        ...produto.toJSON(),
        quantidade_estoque: novaQuantidade,
        ativo: novaQuantidade > 0,
      },
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao realizar entrada de estoque",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function saidaEstoque(req: Request, res: Response) {
  const { id } = req.params;
  const { quantidade, observacao, documento, usuario_id } = req.body;

  if (!quantidade || !usuario_id) {
    return res.status(400).json({
      message: "Quantidade e usuario_id são obrigatórios",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const produto = await ProdutoModel.findByPk(id);
    if (!produto) {
      await transaction.rollback();
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (!validarUnidadeAcesso(produto.unidade_id, req)) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Acesso negado: você não pode fazer saída nesta unidade",
      });
    }

    if (produto.quantidade_estoque < quantidade) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Quantidade insuficiente em estoque",
        estoque_atual: produto.quantidade_estoque,
        quantidade_solicitada: quantidade,
      });
    }

    await MovimentacaoModel.create(
      {
        tipo: "SAIDA",
        quantidade,
        observacao,
        documento,
        produto_id: id,
        usuario_id,
      },
      { transaction }
    );

    const novaQuantidade = produto.quantidade_estoque - quantidade;
    await produto.update(
      {
        quantidade_estoque: novaQuantidade,
        ativo: novaQuantidade > 0,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      message: "Saída de estoque realizada com sucesso",
      produto: {
        ...produto.toJSON(),
        quantidade_estoque: novaQuantidade,
        ativo: novaQuantidade > 0,
      },
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao realizar saída de estoque",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function aprovarProduto(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { preco_custo, preco_venda } = req.body;
    if (
      !req.usuario?.cargo ||
      !["financeiro", "gerente"].includes(req.usuario.cargo)
    ) {
      await transaction.rollback();
      return res.status(403).json({
        message:
          "Acesso negado: apenas financeiro ou gerente podem definir preços.",
      });
    }
    const camposObrigatorios = ["preco_custo", "preco_venda"];
    const camposFaltando = validarCamposObrigatorios(
      req.body,
      camposObrigatorios
    );
    if (camposFaltando.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Campos obrigatórios faltando: ${camposFaltando.join(", ")}`,
      });
    }
    if (!valorPositivo(preco_custo)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Preço de custo deve ser positivo",
      });
    }
    if (!valorPositivo(preco_venda)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Preço de venda deve ser positivo",
      });
    }

    const produto = await ProdutoModel.findByPk(id, { transaction });
    if (!produto) {
      await transaction.rollback();
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (produto.statusProduto !== "pendente") {
      await transaction.rollback();
      return res.status(400).json({
        message: "Produto já foi aprovado ou rejeitado",
      });
    }

    await produto.update(
      {
        preco_custo,
        preco_venda,
        statusProduto: "aprovado",
        ativo: produto.quantidade_estoque > 0,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json({
      message: "Produto aprovado com preços",
      produto,
    });
  } catch (error: unknown) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao aprovar produto",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function buscarProdutosPendentes(req: Request, res: Response) {
  try {
    if (
      !req.usuario?.cargo ||
      !["financeiro", "gerente"].includes(req.usuario.cargo)
    ) {
      return res.status(403).json({
        message:
          "Acesso negado: apenas financeiro ou gerente podem visualizar produtos pendentes.",
      });
    }
    const whereClause: any = { statusProduto: "pendente", ativo: true };
    if (req.usuario.cargo === "financeiro" && req.usuario?.unidade_id) {
      whereClause.unidade_id = req.usuario.unidade_id;
    }

    const produtos = await ProdutoModel.findAll({
      where: whereClause,
      include: [
        { model: CategoriaModel, as: "categoria" },
        { model: UnidadeModel, as: "unidade" },
        { model: UsuarioModel, as: "usuario" },
      ],
      order: [["criado_em", "DESC"]],
    });

    return res.status(200).json(produtos);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar produtos pendentes",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
