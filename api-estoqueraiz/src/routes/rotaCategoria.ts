import { Router } from "express";
import {
  buscarTodasCategorias,
  buscarCategoriaPorId,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria,
} from "../controllers/CategoriaController";
import { verificarAcessoUnidade } from "../middleware/VerificacaoUnidadeMiddleware";

const router = Router();

router.use(verificarAcessoUnidade);
/**
 * @swagger
 * tags:
 *   - name: Categorias
 *     description: Operações relacionadas às categorias
 */
/**
 * @swagger
 * /categorias:
 *   get:
 *     tags:
 *       - Categorias
 *     summary: Retorna todas as categorias
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 */
router.get("/", buscarTodasCategorias);

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     tags:
 *       - Categorias
 *     summary: Retorna uma categoria pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria retornada com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
router.get("/:id", buscarCategoriaPorId);

/**
 * @swagger
 * /categorias:
 *   post:
 *     tags:
 *       - Categorias
 *     summary: Cria uma nova categoria
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
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 */
router.post("/", criarCategoria);

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     tags:
 *       - Categorias
 *     summary: Atualiza uma categoria pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
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
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
router.put("/:id", atualizarCategoria);

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     tags:
 *       - Categorias
 *     summary: Deleta uma categoria pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria deletada com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
router.delete("/:id", deletarCategoria);

export default router;
