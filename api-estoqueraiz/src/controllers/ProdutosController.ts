import { Request, Response } from "express";
import ProdutoModel from "../models/ProdutosModel";
import CategoriaModel from "../models/CategoriasModel";
import UnidadeModel from "../models/UnidadesModel";
import UsuarioModel from "../models/UsuariosModel";
import MovimentacaoModel from "../models/MovimentacoesModel";
import sequelize from "../config/database";
import { validarUnidadeAcesso } from "../middleware/VerificacaoUnidadeMiddleware";

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

  if (!validarUnidadeAcesso(unidade_id, req)) {
    return res.status(403).json({
      message: "Acesso negado: você não pode cadastrar produtos nesta unidade",
    });
  }

  if (
    !nome ||
    !preco_custo ||
    !preco_venda ||
    !categoria_id ||
    !unidade_id ||
    !usuario_id
  ) {
    return res.status(400).json({
      message: "Campos obrigatórios não preenchidos",
    });
  }

  try {
    const produto = await ProdutoModel.create({
      nome,
      descricao,
      codigo_barras,
      preco_custo,
      preco_venda,
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
    });

    return res
      .status(201)
      .json({ message: "Produto criado com sucesso", produto });
  } catch (error: unknown) {
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
            "Acesso negado: você não pode mover produto para esta unidade",
        });
      }
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
      categoria_id,
      unidade_id,
      ativo: quantidade_estoque > 0,
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
