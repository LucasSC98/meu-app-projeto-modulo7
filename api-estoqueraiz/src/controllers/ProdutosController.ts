import { Request, Response } from "express";
import ProdutoModel from "../models/ProdutosModel";
import CategoriaModel from "../models/CategoriasModel";
import UnidadeModel from "../models/UnidadesModel";
import UsuarioModel from "../models/UsuariosModel";

export async function buscarTodosProdutos(req: Request, res: Response) {
  try {
    const produtos = await ProdutoModel.findAll({
      include: [
        { model: CategoriaModel, as: "categoria" },
        { model: UnidadeModel, as: "unidade" },
        { model: UsuarioModel, as: "usuario" },
      ],
      where: { ativo: true },
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
      ativo,
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
    const produtos = await ProdutoModel.findAll({
      where: { categoria_id, ativo: true },
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

  try {
    const produtos = await ProdutoModel.findAll({
      where: { unidade_id, ativo: true },
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
    const produtos = await ProdutoModel.findAll({
      where: {
        ativo: true,
      },
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
