import { Request, Response } from "express";
import MovimentacaoModel from "../models/MovimentacoesModel";
import ProdutoModel from "../models/ProdutosModel";
import CategoriaModel from "../models/CategoriasModel";
import UnidadeModel from "../models/UnidadesModel";
import { Op } from "sequelize";
import sequelize from "../config/database";

interface ProdutoCurvaABC {
  produto_id: number;
  nome: string;
  categoria: string;
  unidade: string;
  quantidade_vendida: number;
  valor_total: number;
  percentual_participacao: number;
  percentual_acumulado: number;
  classificacao: "A" | "B" | "C";
}

interface ResumoCurvaABC {
  classe: "A" | "B" | "C";
  quantidade_produtos: number;
  valor_total: number;
  percentual_valor: number;
  percentual_produtos: number;
}

export async function gerarCurvaABC(req: Request, res: Response) {
  try {
    const { data_inicio, data_fim, unidade_id } = req.query;

    const whereClause: any = {
      tipo: "SAIDA",
    };

    if (data_inicio && data_fim) {
      whereClause.data_movimentacao = {
        [Op.between]: [data_inicio, data_fim],
      };
    }

    if (req.unidadePermitida !== null) {
      whereClause.unidade_origem_id = req.unidadePermitida;
    } else if (unidade_id) {
      whereClause.unidade_origem_id = unidade_id;
    }

    const movimentacoes = await MovimentacaoModel.findAll({
      where: whereClause,
      include: [
        {
          model: ProdutoModel,
          as: "produto",
          attributes: ["id", "nome", "preco_venda"],
          include: [
            { model: CategoriaModel, as: "categoria", attributes: ["nome"] },
            { model: UnidadeModel, as: "unidade", attributes: ["nome"] },
          ],
        },
      ],
      attributes: ["produto_id", "quantidade"],
    });

    if (movimentacoes.length === 0) {
      return res.status(200).json({
        message: "Nenhuma movimentação de saída encontrada para o período",
        produtos: [],
        resumo: [],
        estatisticas: {
          total_produtos: 0,
          valor_total_geral: 0,
          periodo: { data_inicio, data_fim },
        },
      });
    }

    const produtosAgrupados = new Map<
      number,
      {
        produto_id: number;
        nome: string;
        categoria: string;
        unidade: string;
        quantidade_vendida: number;
        preco_venda: number;
      }
    >();

    movimentacoes.forEach((movimentacao: any) => {
      const produto = movimentacao.produto;
      if (!produto || !produto.preco_venda) return;

      const produtoId = produto.id;
      const quantidade = movimentacao.quantidade;
      const precoVenda = parseFloat(produto.preco_venda);

      if (produtosAgrupados.has(produtoId)) {
        const produtoExistente = produtosAgrupados.get(produtoId)!;
        produtoExistente.quantidade_vendida += quantidade;
      } else {
        produtosAgrupados.set(produtoId, {
          produto_id: produtoId,
          nome: produto.nome,
          categoria: produto.categoria?.nome || "Sem categoria",
          unidade: produto.unidade?.nome || "Sem unidade",
          quantidade_vendida: quantidade,
          preco_venda: precoVenda,
        });
      }
    });

    const produtosComValor = Array.from(produtosAgrupados.values()).map(
      (produto) => ({
        ...produto,
        valor_total: produto.quantidade_vendida * produto.preco_venda,
      })
    );

    produtosComValor.sort((a, b) => b.valor_total - a.valor_total);

    const valorTotalGeral = produtosComValor.reduce(
      (total, produto) => total + produto.valor_total,
      0
    );

    let percentualAcumulado = 0;
    const produtosCurvaABC: ProdutoCurvaABC[] = produtosComValor.map(
      (produto) => {
        const percentualParticipacao =
          (produto.valor_total / valorTotalGeral) * 100;
        percentualAcumulado += percentualParticipacao;

        let classificacao: "A" | "B" | "C";
        if (percentualAcumulado <= 80) {
          classificacao = "A";
        } else if (percentualAcumulado <= 95) {
          classificacao = "B";
        } else {
          classificacao = "C";
        }

        return {
          produto_id: produto.produto_id,
          nome: produto.nome,
          categoria: produto.categoria,
          unidade: produto.unidade,
          quantidade_vendida: produto.quantidade_vendida,
          valor_total: produto.valor_total,
          percentual_participacao:
            Math.round(percentualParticipacao * 100) / 100,
          percentual_acumulado: Math.round(percentualAcumulado * 100) / 100,
          classificacao,
        };
      }
    );

    const resumo: ResumoCurvaABC[] = ["A", "B", "C"].map((classe) => {
      const produtosDaClasse = produtosCurvaABC.filter(
        (p) => p.classificacao === classe
      );
      const valorTotalClasse = produtosDaClasse.reduce(
        (total, p) => total + p.valor_total,
        0
      );

      return {
        classe: classe as "A" | "B" | "C",
        quantidade_produtos: produtosDaClasse.length,
        valor_total: valorTotalClasse,
        percentual_valor:
          Math.round((valorTotalClasse / valorTotalGeral) * 10000) / 100,
        percentual_produtos:
          Math.round(
            (produtosDaClasse.length / produtosCurvaABC.length) * 10000
          ) / 100,
      };
    });

    return res.status(200).json({
      message: "Curva ABC gerada com sucesso",
      produtos: produtosCurvaABC,
      resumo,
      estatisticas: {
        total_produtos: produtosCurvaABC.length,
        valor_total_geral: valorTotalGeral,
        periodo: { data_inicio, data_fim },
        unidade_id: unidade_id || "todas",
      },
    });
  } catch (error: unknown) {
    console.error("Erro ao gerar Curva ABC:", error);
    return res.status(500).json({
      message: "Erro ao gerar relatório Curva ABC",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function estatisticasGerais(req: Request, res: Response) {
  try {
    const { unidade_id } = req.query;

    const whereClause: any = {};

    if (req.unidadePermitida !== null) {
      whereClause.unidade_origem_id = req.unidadePermitida;
    } else if (unidade_id) {
      whereClause.unidade_origem_id = unidade_id;
    }

    const [totalMovimentacoes, totalSaidas, totalEntradas] = await Promise.all([
      MovimentacaoModel.count({ where: whereClause }),
      MovimentacaoModel.count({ where: { ...whereClause, tipo: "SAIDA" } }),
      MovimentacaoModel.count({ where: { ...whereClause, tipo: "ENTRADA" } }),
    ]);

    const seiseMesesAtras = new Date();
    seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);

    const movimentacoesPorMes = await MovimentacaoModel.findAll({
      where: {
        ...whereClause,
        data_movimentacao: {
          [Op.gte]: seiseMesesAtras,
        },
      },
      attributes: [
        [
          sequelize.fn(
            "DATE_TRUNC",
            "month",
            sequelize.col("data_movimentacao")
          ),
          "mes",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        "tipo",
      ],
      group: ["mes", "tipo"],
      order: [["mes", "ASC"]],
    });

    return res.status(200).json({
      estatisticas_gerais: {
        total_movimentacoes: totalMovimentacoes,
        total_saidas: totalSaidas,
        total_entradas: totalEntradas,
      },
      movimentacoes_por_mes: movimentacoesPorMes,
    });
  } catch (error: unknown) {
    return res.status(500).json({
      message: "Erro ao buscar estatísticas gerais",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
