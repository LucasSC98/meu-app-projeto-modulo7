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
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao.silva@agrologica.com.br"
 *         cpf:
 *           type: string
 *           example: "123.456.789-00"
 *         status:
 *           type: string
 *           enum: [pendente, aprovado, rejeitado]
 *           example: aprovado
 *         cargo:
 *           type: string
 *           enum: [gerente, estoquista, financeiro]
 *           example: estoquista
 *         unidade_id:
 *           type: integer
 *           example: 1
 *         unidade:
 *           $ref: '#/components/schemas/Unidade'
 *     UsuarioInput:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - cpf
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "João Silva"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao.silva@agrologica.com.br"
 *         senha:
 *           type: string
 *           minLength: 6
 *           description: "Deve conter pelo menos 6 caracteres, uma letra maiúscula e um número"
 *           example: "MinhaSenh@123"
 *         cpf:
 *           type: string
 *           pattern: "^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}$"
 *           example: "123.456.789-00"
 *     UsuarioUpdate:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: "João Silva Santos"
 *         email:
 *           type: string
 *           format: email
 *           example: "joao.santos@agrologica.com.br"
 *         senha:
 *           type: string
 *           minLength: 6
 *           description: "Nova senha (opcional)"
 *           example: "NovaSenh@456"
 *         cpf:
 *           type: string
 *           pattern: "^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}$"
 *           example: "987.654.321-00"
 *     UsuarioAprovacao:
 *       type: object
 *       required:
 *         - cargo
 *         - unidade_id
 *       properties:
 *         cargo:
 *           type: string
 *           enum: [estoquista, financeiro]
 *           example: estoquista
 *         unidade_id:
 *           type: integer
 *           example: 1
 *     CargoInput:
 *       type: object
 *       required:
 *         - cargo
 *       properties:
 *         cargo:
 *           type: string
 *           enum: [gerente, estoquista, financeiro]
 *           example: financeiro
 *     UsuarioResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 * tags:
 *   - name: Usuários
 *     description: Operações relacionadas ao gerenciamento de usuários do sistema WMS
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista todos os usuários do sistema
 *     description: Retorna lista completa de usuários incluindo informações de unidade
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
 *                 $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", verificarToken, verificarAcessoUnidade, buscarTodosUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Busca usuário por ID
 *     description: Retorna detalhes de um usuário específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", verificarToken, verificarAcessoUnidade, buscarUsuarioPorId);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     tags:
 *       - Usuários
 *     summary: Cria novo usuário (cadastro público)
 *     description: Registra novo usuário no sistema com status pendente aguardando aprovação do gerente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *           example:
 *             nome: "João Silva"
 *             email: "joao.silva@agrologica.com.br"
 *             senha: "MinhaSenh@123"
 *             cpf: "123.456.789-00"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário criado com sucesso. Conta aguardando aprovação do gerente."
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "Campos obrigatórios faltando: nome, email, senha, cpf"
 *                     - "Nome deve ter pelo menos 3 caracteres"
 *                     - "Email já está em uso"
 *                     - "CPF já está em uso"
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", criarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Atualiza dados de um usuário
 *     description: Permite atualizar informações pessoais do usuário (nome, email, senha, CPF)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioUpdate'
 *           example:
 *             nome: "João Silva Santos"
 *             email: "joao.santos@agrologica.com.br"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "Nome deve ter pelo menos 3 caracteres"
 *                     - "Email já está em uso"
 *                     - "CPF já está em uso"
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/:id", verificarToken, verificarAcessoUnidade, atualizarUsuário);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     tags:
 *       - Usuários
 *     summary: Deleta um usuário permanentemente
 *     description: Remove completamente o usuário do sistema (hard delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário deletado com sucesso"
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/:id", verificarToken, verificarAcessoUnidade, deletarUsuário);

/**
 * @swagger
 * /usuarios/pendentes:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista usuários pendentes de aprovação (apenas gerentes)
 *     description: Retorna lista de usuários com status pendente aguardando aprovação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários pendentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   email:
 *                     type: string
 *                   cpf:
 *                     type: string
 *                   status:
 *                     type: string
 *                     example: pendente
 *       403:
 *         description: Acesso negado (apenas gerentes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Acesso negado: apenas gerentes podem visualizar usuários pendentes"
 *       500:
 *         description: Erro interno do servidor
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
 *     description: Aprova usuário pendente, definindo cargo e unidade de trabalho. Envia email de confirmação.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário pendente
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioAprovacao'
 *           example:
 *             cargo: "estoquista"
 *             unidade_id: 1
 *     responses:
 *       200:
 *         description: Usuário aprovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "Campos obrigatórios faltando: cargo, unidade_id"
 *                     - "Cargo deve ser estoquista ou financeiro"
 *       403:
 *         description: Acesso negado (apenas gerentes)
 *       404:
 *         description: Usuário pendente ou unidade não encontrado
 *       500:
 *         description: Erro interno do servidor
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
 *     description: Altera status do usuário para rejeitado e envia email de notificação
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário pendente
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário rejeitado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário rejeitado com sucesso"
 *       403:
 *         description: Acesso negado (apenas gerentes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Acesso negado: apenas gerentes podem rejeitar usuários"
 *       404:
 *         description: Usuário pendente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário pendente não encontrado"
 *       500:
 *         description: Erro interno do servidor
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
 *     description: Permite alterar o cargo de usuários já aprovados. Gerentes não podem alterar o próprio cargo para não-gerente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário aprovado
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CargoInput'
 *           example:
 *             cargo: "financeiro"
 *     responses:
 *       200:
 *         description: Cargo alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       400:
 *         description: Dados inválidos ou restrição de segurança
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     - "Campos obrigatórios faltando: cargo"
 *                     - "Cargo deve ser gerente, estoquista ou financeiro"
 *                     - "Não é possível alterar seu próprio cargo para não-gerente"
 *       403:
 *         description: Acesso negado (apenas gerentes)
 *       404:
 *         description: Usuário aprovado não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/:id/alterar-cargo",
  verificarToken,
  verificarAcessoUnidade,
  alterarCargoUsuario
);

export default router;
