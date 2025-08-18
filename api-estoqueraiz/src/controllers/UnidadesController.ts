import { Request, Response } from "express";
import UnidadeModel from "../models/UnidadesModel";

export async function buscarTodasUnidades(req: Request, res: Response) {
  try {
    const unidades = await UnidadeModel.findAll();
    return res.status(200).json(unidades);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar unidades", error });
  }
}

export async function buscarUnidadePorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const unidade = await UnidadeModel.findByPk(id);
    if (!unidade) {
      return res.status(404).json({ message: "Unidade não encontrada" });
    }
    return res.status(200).json(unidade);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar unidade", error });
  }
}

export async function criarUnidade(req: Request, res: Response) {
  const { nome, descricao, rua, numero, bairro, cidade, estado, cep } = req.body;

  if (!nome || !rua || !numero || !bairro || !cidade || !estado || !cep) {
    return res.status(400).json({ 
      message: "Campos obrigatórios não preenchidos"
    });
  }

  try {
    const unidade = await UnidadeModel.create({ nome, descricao, rua, numero, bairro, cidade, estado, cep });
    return res.status(201).json(unidade);
  } catch (error: unknown) {
    return res.status(500).json({ message: "Erro ao criar unidade", error: error instanceof Error ? error.message : String(error) });
  }
}

export async function atualizarUnidade(req: Request, res: Response) {
  const { id } = req.params;
  const { nome, descricao, rua, numero, bairro, cidade, estado, cep } = req.body;

  try {
    const unidade = await UnidadeModel.findByPk(id);
    if (!unidade) {
      return res.status(404).json({ message: "Unidade não encontrada" });
    }
    await unidade.update({ nome, descricao, rua, numero, bairro, cidade, estado, cep });
    return res.status(200).json({ message: "Unidade atualizada com sucesso", unidade });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar unidade", error });
  }
}

export async function deletarUnidade(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const unidade = await UnidadeModel.findByPk(id);
    if (!unidade) {
      return res.status(404).json({ message: "Unidade não encontrada" });
    }
    await unidade.destroy();
    return res.status(200).json({ message: "Unidade deletada com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao deletar unidade", error });
  }
}