import { Router } from "express";
import {
  buscarTodosProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  buscarProdutosPorCategoria,
  buscarProdutosPorUnidade,
  buscarProdutosEstoqueBaixo,
  entradaEstoque,
  saidaEstoque,
} from "../controllers/ProdutosController";
import { verificarAcessoUnidade } from "../middleware/VerificacaoUnidadeMiddleware";

const router = Router();

// Aplicar middleware de verificação de unidade em todas as rotas
router.use(verificarAcessoUnidade);

/**
 * @swagger
 * tags:
 *   - name: Produtos
 *     description: Operações relacionadas aos produtos
 */

/**
 * @swagger
 * /produtos:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Retorna todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 */
router.get("/", buscarTodosProdutos);

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Retorna um produto pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto retornado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.get("/:id", buscarProdutoPorId);

/**
 * @swagger
 * /produtos:
 *   post:
 *     tags:
 *       - Produtos
 *     summary: Cria um novo produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco_custo:
 *                 type: number
 *               preco_venda:
 *                 type: number
 *               categoria_id:
 *                 type: string
 *               unidade_id:
 *                 type: string
 *               usuario_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 */
router.post("/", criarProduto);

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     tags:
 *       - Produtos
 *     summary: Atualiza um produto pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco_custo:
 *                 type: number
 *               preco_venda:
 *                 type: number
 *               categoria_id:
 *                 type: string
 *               unidade_id:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.put("/:id", atualizarProduto);

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     tags:
 *       - Produtos
 *     summary: Desativa um produto pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto desativado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.delete("/:id", deletarProduto);

/**
 * @swagger
 * /produtos/categoria/{categoria_id}:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Retorna produtos por categoria
 *     parameters:
 *       - in: path
 *         name: categoria_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Produtos retornados com sucesso
 */
router.get("/categoria/:categoria_id", buscarProdutosPorCategoria);

/**
 * @swagger
 * /produtos/unidade/{unidade_id}:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Retorna produtos por unidade
 *     parameters:
 *       - in: path
 *         name: unidade_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Produtos retornados com sucesso
 */
router.get("/unidade/:unidade_id", buscarProdutosPorUnidade);

/**
 * @swagger
 * /produtos/estoque/baixo:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Retorna produtos com estoque baixo
 *     responses:
 *       200:
 *         description: Produtos com estoque baixo retornados com sucesso
 */
router.get("/estoque/baixo", buscarProdutosEstoqueBaixo);

/**
 * @swagger
 * /produtos/{id}/entrada:
 *   post:
 *     tags:
 *       - Produtos
 *     summary: Registra entrada de estoque
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade:
 *                 type: number
 *               observacao:
 *                 type: string
 *               documento:
 *                 type: string
 *               usuario_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Entrada registrada com sucesso
 */
router.post("/:id/entrada", entradaEstoque);

/**
 * @swagger
 * /produtos/{id}/saida:
 *   post:
 *     tags:
 *       - Produtos
 *     summary: Registra saída de estoque
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade:
 *                 type: number
 *               observacao:
 *                 type: string
 *               documento:
 *                 type: string
 *               usuario_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Saída registrada com sucesso
 */
router.post("/:id/saida", saidaEstoque);

export default router;
