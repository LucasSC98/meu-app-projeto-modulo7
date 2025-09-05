import { NextFunction, Request, Response } from "express";
import UsuarioModel from "../models/UsuariosModel";

declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
      usuario?: UsuarioModel;
      unidadePermitida?: number | null;
    }
  }
}

export const verificarAcessoUnidade = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.usuarioId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const usuario = await UsuarioModel.findByPk(req.usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    req.usuario = usuario;

    // Apenas gerentes podem acessar todas as unidades
    if (usuario.cargo === "gerente") {
      req.unidadePermitida = null; // null = pode acessar todas
    } else {
      // Estoquistas e financeiros só podem acessar sua unidade
      req.unidadePermitida = usuario.unidade_id;
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao verificar acesso à unidade",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const validarUnidadeAcesso = (
  unidadeId: number,
  req: Request
): boolean => {
  // Se é gerente (pode acessar todas as unidades)
  if (req.unidadePermitida === null) {
    return true;
  }

  // Se só pode acessar uma unidade específica
  return req.unidadePermitida === unidadeId;
};
