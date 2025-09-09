import { Request, Response } from "express";
import UnidadeModel from "../models/UnidadesModel";

export async function buscarTodasUnidades(req: Request, res: Response) {
  try {
    // Para movimentações, todos os usuários podem ver todas as unidades (para destino)
    // A validação é feita na hora de criar a movimentação
    const unidades = await UnidadeModel.findAll();
    return res.status(200).json(unidades);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar unidades",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function buscarUnidadePorId(req: Request, res: Response) {
  const { id } = req.params;
  const unidadeIdNum = parseInt(id);

  try {
    if (req.usuario?.cargo !== "gerente") {
      if (req.unidadePermitida !== unidadeIdNum) {
        return res.status(403).json({
          message:
            "Acesso negado: você não tem permissão para acessar detalhes desta unidade",
        });
      }
    }

    const unidade = await UnidadeModel.findByPk(id);
    if (!unidade) {
      return res.status(404).json({ message: "Unidade não encontrada" });
    }
    return res.status(200).json(unidade);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar unidade",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function criarUnidade(req: Request, res: Response) {
  const { nome, descricao, rua, numero, bairro, cidade, estado, cep } =
    req.body;

  if (req.usuario?.cargo !== "gerente") {
    return res.status(403).json({
      message: "Acesso negado: apenas gerentes podem criar unidades",
    });
  }

  if (!nome || !rua || !numero || !bairro || !cidade || !estado || !cep) {
    return res.status(400).json({
      message: "Campos obrigatórios não preenchidos",
    });
  }

  try {
    const unidade = await UnidadeModel.create({
      nome,
      descricao,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
    });
    return res.status(201).json(unidade);
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao criar unidade",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function atualizarUnidade(req: Request, res: Response) {
  const { id } = req.params;
  const { nome, descricao, rua, numero, bairro, cidade, estado, cep } =
    req.body;
  const unidadeIdNum = parseInt(id);

  if (req.usuario?.cargo !== "gerente") {
    return res.status(403).json({
      message: "Acesso negado: apenas gerentes podem atualizar unidades",
    });
  }

  try {
    const unidade = await UnidadeModel.findByPk(id);
    if (!unidade) {
      return res.status(404).json({ message: "Unidade não encontrada" });
    }
    await unidade.update({
      nome,
      descricao,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      cep,
    });
    return res
      .status(200)
      .json({ message: "Unidade atualizada com sucesso", unidade });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar unidade",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function deletarUnidade(req: Request, res: Response) {
  const { id } = req.params;

  if (req.usuario?.cargo !== "gerente") {
    return res.status(403).json({
      message: "Acesso negado: apenas gerentes podem deletar unidades",
    });
  }

  try {
    const unidade = await UnidadeModel.findByPk(id);
    if (!unidade) {
      return res.status(404).json({ message: "Unidade não encontrada" });
    }
    await unidade.destroy();
    return res.status(200).json({ message: "Unidade deletada com sucesso" });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao deletar unidade",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
