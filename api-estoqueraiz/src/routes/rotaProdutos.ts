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
  buscarProdutosPendentes,
  aprovarProduto,
} from "../controllers/ProdutosController";
import { verificarAcessoUnidade } from "../middleware/VerificacaoUnidadeMiddleware";

const router = Router();

// Aplicar middleware de verificação de unidade em todas as rotas
router.use(verificarAcessoUnidade);

/**
 * @swagger
 * components:
 *   schemas:
 *     Produto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: Fertilizante NPK
 *         descricao:
 *           type: string
 *           example: Fertilizante para milho
 *         codigo_barras:
 *           type: string
 *           example: "7891234567890"
 *         preco_custo:
 *           type: number
 *           format: float
 *           example: 50.5
 *         preco_venda:
 *           type: number
 *           format: float
 *           example: 75.0
 *         quantidade_estoque:
 *           type: integer
 *           example: 100
 *         quantidade_minima:
 *           type: integer
 *           example: 10
 *         data_validade:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *         lote:
 *           type: string
 *           example: "L2025A"
 *         localizacao:
 *           type: string
 *           example: "Corredor 3, Prateleira 2"
 *         imagem_url:
 *           type: string
 *           example: "https://exemplo.com/imagem.jpg"
 *         categoria_id:
 *           type: integer
 *           example: 1
 *         unidade_id:
 *           type: integer
 *           example: 2
 *         usuario_id:
 *           type: integer
 *           example: 5
 *         ativo:
 *           type: boolean
 *           example: true
 *         statusProduto:
 *           type: string
 *           enum: [pendente, aprovado]
 *           example: aprovado
 *         criado_em:
 *           type: string
 *           format: date-time
 *         atualizado_em:
 *           type: string
 *           format: date-time
 *         categoria:
 *           $ref: '#/components/schemas/Categoria'
 *         unidade:
 *           $ref: '#/components/schemas/Unidade'
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 *     Categoria:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome:
 *           type: string
 *         descricao:
 *           type: string
 *     Unidade:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome:
 *           type: string
 *         endereco:
 *           type: string
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *         cargo:
 *           type: string
 *     Movimentacao:
 *       type: object
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [ENTRADA, SAIDA]
 *         quantidade:
 *           type: integer
 *         observacao:
 *           type: string
 *         documento:
 *           type: string
 *         produto_id:
 *           type: integer
 *         usuario_id:
 *           type: integer
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Produtos
 *     description: Operações relacionadas aos produtos do WMS
 */

/**
 * @swagger
 * /produtos:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Lista todos os produtos ativos
 *     description: Retorna uma lista de produtos ativos, filtrados por unidade se aplicável.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", buscarTodosProdutos);

/**
 * @swagger
 * /produtos/pendentes:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Lista produtos pendentes de aprovação (apenas financeiro/gerente)
 *     description: Retorna produtos sem preços definidos, aguardando aprovação.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos pendentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       403:
 *         description: Acesso negado (apenas financeiro ou gerente)
 *       500:
 *         description: Erro interno
 */
router.get("/pendentes", buscarProdutosPendentes);

/**
 * @swagger
 * /produtos/{id}/aprovar:
 *   patch:
 *     tags:
 *       - Produtos
 *     summary: Aprova produto pendente definindo preços (apenas financeiro/gerente)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preco_custo
 *               - preco_venda
 *             properties:
 *               preco_custo:
 *                 type: number
 *                 format: float
 *                 example: 50.5
 *               preco_venda:
 *                 type: number
 *                 format: float
 *                 example: 75.0
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produto aprovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 produto:
 *                   $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.patch("/:id/aprovar", aprovarProduto);

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
 *           type: integer
 *         description: ID do produto
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produto retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.get("/:id", buscarProdutoPorId);

/**
 * @swagger
 * /produtos:
 *   post:
 *     tags:
 *       - Produtos
 *     summary: Cria um novo produto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco_custo
 *               - preco_venda
 *               - categoria_id
 *               - unidade_id
 *               - usuario_id
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Fertilizante NPK
 *               descricao:
 *                 type: string
 *                 example: Fertilizante para milho
 *               codigo_barras:
 *                 type: string
 *                 example: "7891234567890"
 *               preco_custo:
 *                 type: number
 *                 example: 50.5
 *               preco_venda:
 *                 type: number
 *                 example: 75.0
 *               quantidade_estoque:
 *                 type: integer
 *                 example: 100
 *               quantidade_minima:
 *                 type: integer
 *                 example: 10
 *               data_validade:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               lote:
 *                 type: string
 *                 example: "L2025A"
 *               localizacao:
 *                 type: string
 *                 example: "Corredor 3, Prateleira 2"
 *               imagem_url:
 *                 type: string
 *                 example: "https://exemplo.com/imagem.jpg"
 *               categoria_id:
 *                 type: integer
 *                 example: 1
 *               unidade_id:
 *                 type: integer
 *                 example: 2
 *               usuario_id:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produto criado com sucesso
 *                 produto:
 *                   $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Campos obrigatórios não preenchidos
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro ao criar produto
 */
router.post("/", criarProduto);

/**
 * @swagger
 * /produtos/{id}:
 *   patch:
 *     tags:
 *       - Produtos
 *     summary: Atualiza um produto pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 example: Fertilizante NPK Atualizado
 *               preco_custo:
 *                 type: number
 *                 format: float
 *                 example: 55.0
 *               preco_venda:
 *                 type: number
 *                 format: float
 *                 example: 80.0
 *               categoria_id:
 *                 type: integer
 *                 example: 1
 *               unidade_id:
 *                 type: integer
 *                 example: 2
 *               ativo:
 *                 type: boolean
 *                 example: true
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 produto:
 *                   $ref: '#/components/schemas/Produto'
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.patch("/:id", atualizarProduto);

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     tags:
 *       - Produtos
 *     summary: Desativa um produto pelo ID (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produto desativado com sucesso
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
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
 *           type: integer
 *         description: ID da categoria
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produtos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno
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
 *           type: integer
 *         description: ID da unidade
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produtos retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno
 */
router.get("/unidade/:unidade_id", buscarProdutosPorUnidade);

/**
 * @swagger
 * /produtos/estoque/baixo:
 *   get:
 *     tags:
 *       - Produtos
 *     summary: Retorna produtos com estoque baixo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produtos com estoque baixo retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno
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
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidade
 *               - usuario_id
 *             properties:
 *               quantidade:
 *                 type: integer
 *                 example: 50
 *               observacao:
 *                 type: string
 *                 example: "Recebimento de nova remessa"
 *               documento:
 *                 type: string
 *                 example: "NF123456"
 *               usuario_id:
 *                 type: integer
 *                 example: 5
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entrada registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 produto:
 *                   $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
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
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidade
 *               - usuario_id
 *             properties:
 *               quantidade:
 *                 type: integer
 *                 example: 10
 *               observacao:
 *                 type: string
 *                 example: "Venda para cliente X"
 *               documento:
 *                 type: string
 *                 example: "PED789"
 *               usuario_id:
 *                 type: integer
 *                 example: 5
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saída registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 produto:
 *                   $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos ou quantidade insuficiente
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno
 */
router.post("/:id/saida", saidaEstoque);

export default router;
