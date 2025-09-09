import express from "express";
import {
  atualizarUsuário,
  buscarTodosUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  deletarUsuário,
  listarUsuariosPendentes,
  aprovarUsuario,
  rejeitarUsuario,
  alterarCargoUsuario,
} from "../controllers/UsuariosController";
import { verificarToken } from "../middleware/AutenticacaoMiddleware";
import { verificarAcessoUnidade } from "../middleware/VerificacaoUnidadeMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Usuários
 *     description: Operações relacionadas aos usuários
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Retorna todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */
router.get("/", verificarToken, verificarAcessoUnidade, buscarTodosUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Retorna um usuário pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário retornado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/:id", verificarToken, verificarAcessoUnidade, buscarUsuarioPorId);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     tags:
 *       - Usuários
 *     summary: Cria um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post("/", criarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Atualiza um usuário pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.put("/:id", verificarToken, verificarAcessoUnidade, atualizarUsuário);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     tags:
 *       - Usuários
 *     summary: Deleta um usuário pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete("/:id", verificarToken, verificarAcessoUnidade, deletarUsuário);

/**
 * @swagger
 * /usuarios/pendentes:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista usuários com status pendente (apenas gerentes)
 *     responses:
 *       200:
 *         description: Lista de usuários pendentes
 *       403:
 *         description: Acesso negado
 */
router.get(
  "/pendentes",
  verificarToken,
  verificarAcessoUnidade,
  listarUsuariosPendentes
);

/**
 * @swagger
 * /usuarios/{id}/aprovar:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Aprova usuário pendente e define cargo/unidade (apenas gerentes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cargo:
 *                 type: string
 *                 enum: [estoquista, financeiro]
 *               unidade_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuário aprovado
 *       403:
 *         description: Acesso negado
 */
router.put(
  "/:id/aprovar",
  verificarToken,
  verificarAcessoUnidade,
  aprovarUsuario
);

/**
 * @swagger
 * /usuarios/{id}/rejeitar:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Rejeita usuário pendente (apenas gerentes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário rejeitado
 *       403:
 *         description: Acesso negado
 */
router.put(
  "/:id/rejeitar",
  verificarToken,
  verificarAcessoUnidade,
  rejeitarUsuario
);

/**
 * @swagger
 * /usuarios/{id}/alterar-cargo:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Altera cargo de usuário aprovado (apenas gerentes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cargo:
 *                 type: string
 *                 enum: [gerente, estoquista, financeiro]
 *     responses:
 *       200:
 *         description: Cargo alterado com sucesso
 *       403:
 *         description: Acesso negado
 */
router.put(
  "/:id/alterar-cargo",
  verificarToken,
  verificarAcessoUnidade,
  alterarCargoUsuario
);

export default router;
