import express from "express";
import {
  buscarTodosUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
} from "../controllers/UsuariosController";

const router = express.Router();

router.get("/", buscarTodosUsuarios);
router.get("/:id", buscarUsuarioPorId);
router.post("/", criarUsuario);

export default router;
