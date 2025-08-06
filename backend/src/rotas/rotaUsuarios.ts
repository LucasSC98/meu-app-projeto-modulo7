import express from "express";
import {
  atualizarUsuário,
  buscarTodosUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
} from "../controllers/UsuariosController";

const router = express.Router();

router.get("/", buscarTodosUsuarios);
router.get("/:id", buscarUsuarioPorId);
router.post("/", criarUsuario);
router.put("/:id", atualizarUsuário);

export default router;
