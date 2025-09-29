import { Router } from "express";
import {
  solicitarRecuperacaoSenha,
  redefinirSenha,
} from "../controllers/RecuperacaoSenhaController";

const router = Router();

router.post("/recuperar-senha", solicitarRecuperacaoSenha);
router.post("/redefinir-senha", redefinirSenha);

export default router;
