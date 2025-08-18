import express from "express";
import {
  atualizarUsuário,
  buscarTodosUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  deletarUsuário,
} from "../controllers/UsuariosController";

const router = express.Router();

router.get("/", buscarTodosUsuarios);
router.get("/:id", buscarUsuarioPorId);
router.post("/", criarUsuario);
router.put("/:id", atualizarUsuário);
router.delete("/:id", deletarUsuário);

export default router;
