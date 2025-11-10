import { Router } from "express";
import {
  gerarCurvaABC,
  estatisticasGerais,
} from "../controllers/RelatorioController";
import { verificarAcessoUnidade } from "../middleware/VerificacaoUnidadeMiddleware";

const router = Router();

router.use(verificarAcessoUnidade);

/**
 * @swagger
 * components:
 *   schemas:
 *     ProdutoCurvaABC:
 *       type: object
 *       properties:
 *         produto_id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Fertilizante NPK"
 *         categoria:
 *           type: string
 *           example: "Fertilizantes"
 *         unidade:
 *           type: string
 *           example: "Unidade Centro"
 *         quantidade_vendida:
 *           type: integer
 *           example: 150
 *         valor_total:
 *           type: number
 *           example: 12500.00
 *         percentual_participacao:
 *           type: number
 *           example: 25.5
 *         percentual_acumulado:
 *           type: number
 *           example: 45.8
 *         classificacao:
 *           type: string
 *           enum: [A, B, C]
 *           example: "A"
 *     ResumoCurvaABC:
 *       type: object
 *       properties:
 *         classe:
 *           type: string
 *           enum: [A, B, C]
 *           example: "A"
 *         quantidade_produtos:
 *           type: integer
 *           example: 5
 *         valor_total:
 *           type: number
 *           example: 35000.00
 *         percentual_valor:
 *           type: number
 *           example: 80.0
 *         percentual_produtos:
 *           type: number
 *           example: 20.0
 * tags:
 *   - name: Relatórios
 *     description: Operações relacionadas a relatórios e análises
 */

/**
 * @swagger
 * /relatorios/curva-abc:
 *   get:
 *     tags:
 *       - Relatórios
 *     summary: Gera relatório de Curva ABC
 *     description: Analisa produtos por valor de vendas e classifica em A, B ou C conforme participação no faturamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para análise (opcional)
 *         example: "2024-01-01"
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para análise (opcional)
 *         example: "2024-12-31"
 *       - in: query
 *         name: unidade_id
 *         schema:
 *           type: integer
 *         description: Filtrar por unidade específica (apenas gerentes)
 *         example: 1
 *     responses:
 *       200:
 *         description: Curva ABC gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Curva ABC gerada com sucesso"
 *                 produtos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProdutoCurvaABC'
 *                 resumo:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ResumoCurvaABC'
 *                 estatisticas:
 *                   type: object
 *                   properties:
 *                     total_produtos:
 *                       type: integer
 *                       example: 25
 *                     valor_total_geral:
 *                       type: number
 *                       example: 43750.00
 *                     periodo:
 *                       type: object
 *                       properties:
 *                         data_inicio:
 *                           type: string
 *                         data_fim:
 *                           type: string
 *                     unidade_id:
 *                       type: string
 *                       example: "todas"
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/curva-abc", gerarCurvaABC);

/**
 * @swagger
 * /relatorios/estatisticas:
 *   get:
 *     tags:
 *       - Relatórios
 *     summary: Estatísticas gerais de movimentações
 *     description: Retorna estatísticas gerais sobre movimentações do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unidade_id
 *         schema:
 *           type: integer
 *         description: Filtrar por unidade específica (apenas gerentes)
 *         example: 1
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estatisticas_gerais:
 *                   type: object
 *                   properties:
 *                     total_movimentacoes:
 *                       type: integer
 *                     total_saidas:
 *                       type: integer
 *                     total_entradas:
 *                       type: integer
 *                 movimentacoes_por_mes:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/estatisticas", estatisticasGerais);

export default router;
