import { Request, Response } from "express";
import CategoriaModel from "../models/CategoriasModel";

export async function buscarTodasCategorias(req: Request, res: Response) {
  try {
    const categorias = await CategoriaModel.findAll();
    return res.status(200).json(categorias);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao buscar categorias", error });
  }
}

export async function buscarCategoriaPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const categoria = await CategoriaModel.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    return res.status(200).json(categoria);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar categoria", error });
  }
}

export async function criarCategoria(req: Request, res: Response) {
  const { nome, descricao } = req.body;

  try {
    const novaCategoria = await CategoriaModel.create({ nome, descricao });
    return res.status(201).json(novaCategoria);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar categoria", error });
  }
}

export async function atualizarCategoria(req: Request, res: Response) {
  const { id } = req.params;
  const { nome, descricao } = req.body;

  try {
    const categoria = await CategoriaModel.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    await categoria.update({ nome, descricao });
    return res
      .status(200)
      .json({ message: "Categoria atualizada com sucesso", categoria });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao atualizar categoria", error });
  }
}

export async function deletarCategoria(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const categoria = await CategoriaModel.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    await categoria.destroy();
    return res
      .status(200)
      .json({ message: "Categoria deletada com sucesso", categoria });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao deletar categoria", error });
  }
}
