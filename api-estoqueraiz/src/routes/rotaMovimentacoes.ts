import { Router } from "express";
import {
  criarMovimentacao,
  buscarMovimentacoes,
  buscarMovimentacaoPorId,
  relatorioMovimentacoesPorPeriodo,
  buscarUsuariosComMovimentacoes,
} from "../controllers/MovimentacoesController";
import { verificarAcessoUnidade } from "../middleware/VerificacaoUnidadeMiddleware";

const router = Router();

router.use(verificarAcessoUnidade);

router.post("/", criarMovimentacao);
router.get("/", buscarMovimentacoes);
router.get("/relatorio", relatorioMovimentacoesPorPeriodo);
router.get("/:id", buscarMovimentacaoPorId);
router.get("/usuarios", buscarUsuariosComMovimentacoes);

export default router;
