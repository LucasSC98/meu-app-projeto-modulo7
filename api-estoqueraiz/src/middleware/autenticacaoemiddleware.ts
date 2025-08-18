import { NextFunction, Request, Response } from "express";
import { verificarToken as validarJwt } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}

export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const decoded = validarJwt(token) as { id: number };
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" + error });
  }
};
