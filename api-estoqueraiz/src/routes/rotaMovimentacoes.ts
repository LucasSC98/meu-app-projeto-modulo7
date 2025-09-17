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

/**
 * @swagger
 * components:
 *   schemas:
 *     Movimentacao:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         tipo:
 *           type: string
 *           enum: [ENTRADA, SAIDA, TRANSFERENCIA, AJUSTE]
 *           example: ENTRADA
 *         quantidade:
 *           type: integer
 *           example: 50
 *         data_movimentacao:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         observacao:
 *           type: string
 *           example: "Recebimento de nova remessa"
 *         documento:
 *           type: string
 *           example: "NF123456"
 *         produto_id:
 *           type: integer
 *           example: 5
 *         usuario_id:
 *           type: integer
 *           example: 3
 *         unidade_origem_id:
 *           type: integer
 *           example: 7
 *         unidade_destino_id:
 *           type: integer
 *           example: 8
 *         produto:
 *           $ref: '#/components/schemas/Produto'
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 *         unidade_origem:
 *           $ref: '#/components/schemas/Unidade'
 *         unidade_destino:
 *           $ref: '#/components/schemas/Unidade'
 *         criado_em:
 *           type: string
 *           format: date-time
 *         atualizado_em:
 *           type: string
 *           format: date-time
 *     MovimentacaoInput:
 *       type: object
 *       required:
 *         - tipo
 *         - quantidade
 *         - produto_id
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [ENTRADA, SAIDA, TRANSFERENCIA, AJUSTE]
 *           example: ENTRADA
 *         quantidade:
 *           type: integer
 *           minimum: 1
 *           example: 50
 *         observacao:
 *           type: string
 *           example: "Recebimento de nova remessa"
 *         documento:
 *           type: string
 *           example: "NF123456"
 *         produto_id:
 *           type: integer
 *           example: 5
 *         usuario_id:
 *           type: integer
 *           example: 3
 *         unidade_origem_id:
 *           type: integer
 *           example: 7
 *         unidade_destino_id:
 *           type: integer
 *           example: 8
 *           description: "Obrigatório apenas para transferências"
 *     RelatorioMovimentacoes:
 *       type: object
 *       properties:
 *         periodo:
 *           type: object
 *           properties:
 *             data_inicio:
 *               type: string
 *               format: date
 *             data_fim:
 *               type: string
 *               format: date
 *         resumo:
 *           type: object
 *           properties:
 *             ENTRADA:
 *               type: object
 *               properties:
 *                 quantidade:
 *                   type: integer
 *                 itens:
 *                   type: integer
 *             SAIDA:
 *               type: object
 *               properties:
 *                 quantidade:
 *                   type: integer
 *                 itens:
 *                   type: integer
 *             TRANSFERENCIA:
 *               type: object
 *               properties:
 *                 quantidade:
 *                   type: integer
 *                 itens:
 *                   type: integer
 *             AJUSTE:
 *               type: object
 *               properties:
 *                 quantidade:
 *                   type: integer
 *                 itens:
 *                   type: integer
 *         movimentacoes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Movimentacao'
 *         total_movimentacoes:
 *           type: integer
 * tags:
 *   - name: Movimentações
 *     description: Operações relacionadas às movimentações de estoque
 */

/**
 * @swagger
 * /movimentacoes:
 *   post:
 *     tags:
 *       - Movimentações
 *     summary: Cria uma nova movimentação de estoque
 *     description: Registra entrada, saída, transferência ou ajuste de produtos no estoque
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimentacaoInput'
 *           examples:
 *             entrada:
 *               summary: Entrada de estoque
 *               value:
 *                 tipo: ENTRADA
 *                 quantidade: 100
 *                 produto_id: 5
 *                 usuario_id: 3
 *                 unidade_origem_id: 7
 *                 observacao: "Recebimento de nova remessa"
 *                 documento: "NF123456"
 *             saida:
 *               summary: Saída de estoque
 *               value:
 *                 tipo: SAIDA
 *                 quantidade: 50
 *                 produto_id: 5
 *                 usuario_id: 3
 *                 unidade_origem_id: 7
 *                 observacao: "Venda para cliente"
 *                 documento: "PED789"
 *             transferencia:
 *               summary: Transferência entre unidades
 *               value:
 *                 tipo: TRANSFERENCIA
 *                 quantidade: 30
 *                 produto_id: 5
 *                 usuario_id: 3
 *                 unidade_origem_id: 7
 *                 unidade_destino_id: 8
 *                 observacao: "Redistribuição de estoque"
 *             ajuste:
 *               summary: Ajuste de estoque
 *               value:
 *                 tipo: AJUSTE
 *                 quantidade: 150
 *                 produto_id: 5
 *                 usuario_id: 3
 *                 unidade_origem_id: 7
 *                 observacao: "Correção após inventário"
 *     responses:
 *       201:
 *         description: Movimentação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Movimentação criada com sucesso"
 *                 movimentacao:
 *                   $ref: '#/components/schemas/Movimentacao'
 *                 estoque_atualizado:
 *                   type: integer
 *                   example: 150
 *       400:
 *         description: Dados inválidos ou quantidade insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "Campos obrigatórios faltando: tipo, quantidade"
 *                     - "Quantidade deve ser maior que zero"
 *                     - "Quantidade insuficiente em estoque para saída"
 *                     - "Unidade de origem deve ser diferente da de destino"
 *                 estoque_atual:
 *                   type: integer
 *                 quantidade_solicitada:
 *                   type: integer
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Produto, usuário ou unidade não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", criarMovimentacao);

/**
 * @swagger
 * /movimentacoes:
 *   get:
 *     tags:
 *       - Movimentações
 *     summary: Lista movimentações com filtros e paginação
 *     description: Retorna lista paginada de movimentações com opções de filtro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: produto_id
 *         schema:
 *           type: integer
 *         description: Filtrar por produto específico
 *         example: 5
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [ENTRADA, SAIDA, TRANSFERENCIA, AJUSTE]
 *         description: Filtrar por tipo de movimentação
 *         example: ENTRADA
 *       - in: query
 *         name: unidade_id
 *         schema:
 *           type: integer
 *         description: Filtrar por unidade (origem ou destino)
 *         example: 7
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do filtro
 *         example: "2024-01-01"
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do filtro
 *         example: "2024-01-31"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página da listagem
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Itens por página
 *         example: 20
 *     responses:
 *       200:
 *         description: Lista de movimentações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movimentacoes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movimentacao'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                       example: 1
 *                     total_pages:
 *                       type: integer
 *                       example: 5
 *                     total_items:
 *                       type: integer
 *                       example: 95
 *                     items_per_page:
 *                       type: integer
 *                       example: 20
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", buscarMovimentacoes);

/**
 * @swagger
 * /movimentacoes/relatorio:
 *   get:
 *     tags:
 *       - Movimentações
 *     summary: Gera relatório de movimentações por período
 *     description: Retorna resumo estatístico e detalhes de movimentações em um período específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do relatório
 *         example: "2024-01-01"
 *       - in: query
 *         name: data_fim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do relatório
 *         example: "2024-01-31"
 *       - in: query
 *         name: unidade_id
 *         schema:
 *           type: integer
 *         description: Filtrar por unidade específica
 *         example: 7
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioMovimentacoes'
 *       400:
 *         description: Parâmetros obrigatórios não fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Parâmetros obrigatórios faltando: data_inicio, data_fim"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/relatorio", relatorioMovimentacoesPorPeriodo);

/**
 * @swagger
 * /movimentacoes/{id}:
 *   get:
 *     tags:
 *       - Movimentações
 *     summary: Busca movimentação por ID
 *     description: Retorna detalhes de uma movimentação específica incluindo dados relacionados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da movimentação
 *         example: 1
 *     responses:
 *       200:
 *         description: Movimentação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movimentacao'
 *       404:
 *         description: Movimentação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Movimentação não encontrada"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", buscarMovimentacaoPorId);

/**
 * @swagger
 * /movimentacoes/usuarios:
 *   get:
 *     tags:
 *       - Movimentações
 *     summary: Lista usuários que fizeram movimentações
 *     description: Retorna lista de usuários que possuem movimentações registradas no sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 3
 *                   nome:
 *                     type: string
 *                     example: "João Silva"
 *                   email:
 *                     type: string
 *                     example: "joao.silva@agrologica.com.br"
 *                   cargo:
 *                     type: string
 *                     example: "estoquista"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/usuarios", buscarUsuariosComMovimentacoes);

export default router;
