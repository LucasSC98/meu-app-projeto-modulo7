import { Router } from "express";
import {
  criarMovimentacao,
  buscarMovimentacoes,
  buscarMovimentacaoPorId,
  relatorioMovimentacoesPorPeriodo,
  buscarUsuariosComMovimentacoes,
} from "../controllers/MovimentacoesController";

const router = Router();

router.post("/", criarMovimentacao);
router.get("/", buscarMovimentacoes);
router.get("/relatorio", relatorioMovimentacoesPorPeriodo);
router.get("/:id", buscarMovimentacaoPorId);
router.get("/usuarios", buscarUsuariosComMovimentacoes);

export default router;
