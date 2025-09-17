import { Request, Response } from "express";
import CategoriaModel from "../models/CategoriasModel";
import { validarCamposObrigatorios } from "../utils/validacoes";
import sequelize from "../config/database";

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
  const transaction = await sequelize.transaction();
  try {
    const { nome, descricao } = req.body;
    const camposFaltando = validarCamposObrigatorios(req.body, ["nome"]);
    if (camposFaltando.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Campos obrigatórios que estão faltando: ${camposFaltando.join(
          ", "
        )}`,
      });
    }
    const categoria = await CategoriaModel.create(
      { nome, descricao },
      { transaction }
    );
    await transaction.commit();
    return res
      .status(201)
      .json({ message: "Categoria criada com sucesso", categoria });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      message: "Erro ao criar categoria",
      error: error instanceof Error ? error.message : error,
    });
  }
}

export async function atualizarCategoria(req: Request, res: Response) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const camposFaltando = validarCamposObrigatorios(req.body, ["nome"]);
    if (camposFaltando.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Os campos obrigatórios que estão faltando: ${camposFaltando.join(
          ", "
        )}`,
      });
    }
    const categoria = await CategoriaModel.findByPk(id);
    if (!categoria) {
      await transaction.rollback();
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    await categoria.update({ nome, descricao });
    await transaction.commit();
    return res
      .status(200)
      .json({ message: "Categoria atualizada com sucesso", categoria });
  } catch (error) {
    await transaction.rollback();
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
