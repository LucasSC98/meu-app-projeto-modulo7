import jwt from "jsonwebtoken";
import UsuariosModelo from "../models/UsuariosModel";

const JWT_SECRET = process.env.JWT_SECRET || "uma_senha_boa_e_segura";
const JWT_EXPIRATION = "2h";

export const gerarToken = (usuario: UsuariosModelo): string => {
  return jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};

export const gerarTokenRecuperacao = (usuario: UsuariosModelo): string => {
  return jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const verificarToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
