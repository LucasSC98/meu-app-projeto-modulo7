import { Router } from "express";
import {
  buscarTodasUnidades,
  buscarUnidadePorId,
  criarUnidade,
  atualizarUnidade,
  deletarUnidade,
} from "../controllers/UnidadesController";
import { verificarAcessoUnidade } from "../middleware/VerificacaoUnidadeMiddleware";

const router = Router();

// Aplicar middleware de verificação de unidade em todas as rotas
router.use(verificarAcessoUnidade);

/**
 * @swagger
 * tags:
 *   - name: Unidades
 *     description: Operações relacionadas às unidades
 */

/**
 * @swagger
 * /unidades:
 *   get:
 *     tags:
 *       - Unidades
 *     summary: Retorna todas as unidades
 *     responses:
 *       200:
 *         description: Lista de unidades retornada com sucesso
 */
router.get("/", buscarTodasUnidades);

/**
 * @swagger
 * /unidades/{id}:
 *   get:
 *     tags:
 *       - Unidades
 *     summary: Retorna uma unidade pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Unidade retornada com sucesso
 *       404:
 *         description: Unidade não encontrada
 */
router.get("/:id", buscarUnidadePorId);

/**
 * @swagger
 * /unidades:
 *   post:
 *     tags:
 *       - Unidades
 *     summary: Cria uma nova unidade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               rua:
 *                 type: string
 *               numero:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *     responses:
 *       201:
 *         description: Unidade criada com sucesso
 */
router.post("/", criarUnidade);

/**
 * @swagger
 * /unidades/{id}:
 *   put:
 *     tags:
 *       - Unidades
 *     summary: Atualiza uma unidade pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               rua:
 *                 type: string
 *               numero:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unidade atualizada com sucesso
 *       404:
 *         description: Unidade não encontrada
 */
router.put("/:id", atualizarUnidade);

/**
 * @swagger
 * /unidades/{id}:
 *   delete:
 *     tags:
 *       - Unidades
 *     summary: Deleta uma unidade pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Unidade deletada com sucesso
 *       404:
 *         description: Unidade não encontrada
 */
router.delete("/:id", deletarUnidade);

export default router;
