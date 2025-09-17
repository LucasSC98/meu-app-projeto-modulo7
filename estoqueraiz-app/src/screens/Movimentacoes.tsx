import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  RefreshControl,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import Header from "../components/Header";
import api from "../services/api";
import Toast from "react-native-toast-message";

type MovimentacoesScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "Movimentacoes"
>;

interface Movimentacao {
  id: number;
  tipo: "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE";
  quantidade: number;
  data_movimentacao: string;
  observacao?: string;
  documento?: string;
  produto: {
    id: number;
    nome: string;
  };
  usuario: {
    id: number;
    nome: string;
  };
  unidade_origem?: {
    id: number;
    nome: string;
  };
  unidade_destino?: {
    id: number;
    nome: string;
  };
  criado_em: string;
}

export default function Movimentacoes() {
  const navigation = useNavigation<MovimentacoesScreenProp>();

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [movimentacoesFiltradas, setMovimentacoesFiltradas] = useState<
    Movimentacao[]
  >([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const [produtos, setProdutos] = useState<any[]>([]);
  const [, setUsuarios] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);

  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<any>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<string>("");
  const [termoPesquisa, setTermoPesquisa] = useState("");

  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false);
  const [modalUsuarioVisivel, setModalUsuarioVisivel] = useState(false);
  const [modalUnidadeVisivel, setModalUnidadeVisivel] = useState(false);
  const [modalTipoVisivel, setModalTipoVisivel] = useState(false);
  const [modalFiltrosVisivel, setModalFiltrosVisivel] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    movimentacoes,
    produtoSelecionado,
    usuarioSelecionado,
    unidadeSelecionada,
    tipoSelecionado,
    termoPesquisa,
  ]);

  async function carregarDados() {
    try {
      setCarregando(true);

      const [
        responseMovimentacoes,
        responseProdutos,
        responseUsuarios,
        responseUnidades,
      ] = await Promise.all([
        api.get("/movimentacoes"),
        api.get("/produtos"),
        api.get("/usuarios"),
        api.get("/unidades"),
      ]);

      const dadosMovimentacoes =
        responseMovimentacoes.data?.movimentacoes || [];

      const produtosAtivos = Array.isArray(responseProdutos.data)
        ? responseProdutos.data.filter(
            (produto: any) => produto.quantidade_estoque > 0
          )
        : [];

      setMovimentacoes(
        Array.isArray(dadosMovimentacoes) ? dadosMovimentacoes : []
      );
      setProdutos(produtosAtivos);
      setUsuarios(
        Array.isArray(responseUsuarios.data) ? responseUsuarios.data : []
      );
      setUnidades(
        Array.isArray(responseUnidades.data) ? responseUnidades.data : []
      );

      setMovimentacoesFiltradas(
        Array.isArray(dadosMovimentacoes) ? dadosMovimentacoes : []
      );
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      console.error(
        "Detalhes do erro:",
        error instanceof Error ? error.message : String(error)
      );

      Toast.show({
        type: "error",
        text1: "Erro de Conexão",
        text2: "Verifique se o backend está rodando e o IP está correto",
        position: "top",
        visibilityTime: 5000,
      });
    } finally {
      setCarregando(false);
    }
  }

  async function atualizarLista() {
    try {
      setAtualizando(true);
      const response = await api.get("/movimentacoes");
      const dados = response.data?.movimentacoes || [];
      setMovimentacoes(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
    } finally {
      setAtualizando(false);
    }
  }

  function aplicarFiltros() {
    let filtradas = Array.isArray(movimentacoes) ? [...movimentacoes] : [];

    if (produtoSelecionado && produtoSelecionado.id) {
      filtradas = filtradas.filter(
        (m) => m && m.produto && m.produto.id === produtoSelecionado.id
      );
    }

    if (usuarioSelecionado && usuarioSelecionado.id) {
      filtradas = filtradas.filter(
        (m) => m && m.usuario && m.usuario.id === usuarioSelecionado.id
      );
    }

    if (unidadeSelecionada && unidadeSelecionada.id) {
      filtradas = filtradas.filter(
        (m) =>
          m &&
          ((m.unidade_origem &&
            m.unidade_origem.id === unidadeSelecionada.id) ||
            (m.unidade_destino &&
              m.unidade_destino.id === unidadeSelecionada.id))
      );
    }

    if (tipoSelecionado) {
      filtradas = filtradas.filter((m) => m && m.tipo === tipoSelecionado);
    }

    if (termoPesquisa.trim()) {
      const termo = termoPesquisa.toLowerCase();
      filtradas = filtradas.filter(
        (m) =>
          m &&
          ((m.produto &&
            m.produto.nome &&
            m.produto.nome.toLowerCase().includes(termo)) ||
            (m.usuario &&
              m.usuario.nome &&
              m.usuario.nome.toLowerCase().includes(termo)) ||
            (m.observacao && m.observacao.toLowerCase().includes(termo)) ||
            (m.documento && m.documento.toLowerCase().includes(termo)))
      );
    }

    setMovimentacoesFiltradas(filtradas);
  }

  function limparFiltros() {
    setProdutoSelecionado(null);
    setUsuarioSelecionado(null);
    setUnidadeSelecionada(null);
    setTipoSelecionado("");
    setTermoPesquisa("");
    setModalFiltrosVisivel(false);
  }

  function getTipoCor(tipo: string) {
    switch (tipo) {
      case "ENTRADA":
        return "#4CAF50";
      case "SAIDA":
        return "#F44336";
      case "TRANSFERENCIA":
        return "#2196F3";
      case "AJUSTE":
        return "#FF9800";
      default:
        return "#666";
    }
  }

  function formatarData(data: string) {
    try {
      if (!data) return "Data não disponível";
      const date = new Date(data);
      if (isNaN(date.getTime())) return "Data inválida";
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data não disponível";
    }
  }

  function renderMovimentacao({ item }: { item: Movimentacao }) {
    if (!item) return null;

    return (
      <View style={styles.movimentacaoCard}>
        <View style={styles.movimentacaoHeader}>
          <View style={styles.tipoContainer}>
            <Text
              style={[
                styles.tipoBadge,
                { backgroundColor: getTipoCor(item.tipo || "AJUSTE") },
              ]}
            >
              {item.tipo || "AJUSTE"}
            </Text>
          </View>
          <Text style={styles.dataText}>
            {item.data_movimentacao
              ? formatarData(item.data_movimentacao)
              : "Data não disponível"}
          </Text>
        </View>

        <View style={styles.movimentacaoBody}>
          <Text style={styles.produtoNome}>
            {item.produto?.nome || "Produto não informado"}
          </Text>
          <Text style={styles.quantidadeText}>
            Quantidade: {item.quantidade || 0}
          </Text>
          <Text style={styles.usuarioText}>
            Por: {item.usuario?.nome || "Usuário não informado"}
          </Text>

          {item.unidade_origem && (
            <Text style={styles.unidadeText}>
              Origem: {item.unidade_origem.nome || "Unidade não informada"}
            </Text>
          )}

          {item.unidade_destino && (
            <Text style={styles.unidadeText}>
              Destino: {item.unidade_destino.nome || "Unidade não informada"}
            </Text>
          )}

          {item.observacao && (
            <Text style={styles.observacaoText}>Obs: {item.observacao}</Text>
          )}

          {item.documento && (
            <Text style={styles.documentoText}>Doc: {item.documento}</Text>
          )}
        </View>
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando movimentações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        titulo={`Movimentações (${movimentacoesFiltradas.length})`}
        onPressVoltar={() => navigation.goBack()}
        botaoDireita={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("CadastroMovimentacao")}
              accessibilityLabel="Adicionar nova movimentação"
              accessibilityRole="button"
            >
              <MaterialIcons name="add" size={24} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setModalFiltrosVisivel(true)}
              accessibilityLabel="Abrir filtros"
              accessibilityRole="button"
            >
              <MaterialIcons name="filter-list" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar movimentações..."
            value={termoPesquisa}
            onChangeText={setTermoPesquisa}
          />
          {termoPesquisa ? (
            <TouchableOpacity onPress={() => setTermoPesquisa("")}>
              <MaterialIcons name="clear" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={
          Array.isArray(movimentacoesFiltradas) ? movimentacoesFiltradas : []
        }
        keyExtractor={(item) =>
          item?.id?.toString() || Math.random().toString()
        }
        renderItem={renderMovimentacao}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizarLista}
            colors={["#2196F3"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              Nenhuma movimentação encontrada
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalFiltrosVisivel}
        onRequestClose={() => setModalFiltrosVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setModalFiltrosVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => {
                  setModalFiltrosVisivel(false);
                  setModalTipoVisivel(true);
                }}
              >
                <Text style={styles.filterLabel}>Tipo</Text>
                <Text style={styles.filterValue}>
                  {tipoSelecionado || "Todos"}
                </Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => {
                  setModalFiltrosVisivel(false);
                  setModalProdutoVisivel(true);
                }}
              >
                <Text style={styles.filterLabel}>Produto</Text>
                <Text style={styles.filterValue}>
                  {produtoSelecionado?.nome || "Todos"}
                </Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => {
                  setModalFiltrosVisivel(false);
                  setModalUsuarioVisivel(true);
                }}
              >
                <Text style={styles.filterLabel}>Usuário</Text>
                <Text style={styles.filterValue}>
                  {usuarioSelecionado?.nome || "Todos"}
                </Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => {
                  setModalFiltrosVisivel(false);
                  setModalUnidadeVisivel(true);
                }}
              >
                <Text style={styles.filterLabel}>Unidade</Text>
                <Text style={styles.filterValue}>
                  {unidadeSelecionada?.nome || "Todas"}
                </Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={limparFiltros}
                >
                  <Text style={styles.clearButtonText}>Limpar Filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setModalFiltrosVisivel(false)}
                >
                  <Text style={styles.applyButtonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalTipoVisivel}
        onRequestClose={() => setModalTipoVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Tipo</Text>
              <TouchableOpacity onPress={() => setModalTipoVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setTipoSelecionado("");
                  setModalTipoVisivel(false);
                }}
              >
                <Text style={styles.modalOptionText}>Todos</Text>
              </TouchableOpacity>
              {["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"].map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={styles.modalOption}
                  onPress={() => {
                    setTipoSelecionado(tipo);
                    setModalTipoVisivel(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{tipo}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalProdutoVisivel}
        onRequestClose={() => setModalProdutoVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Produto</Text>
              <TouchableOpacity onPress={() => setModalProdutoVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setProdutoSelecionado(null);
                  setModalProdutoVisivel(false);
                }}
              >
                <Text style={styles.modalOptionText}>Todos</Text>
              </TouchableOpacity>
              {Array.isArray(produtos) &&
                produtos.map((produto) => (
                  <TouchableOpacity
                    key={produto?.id || Math.random()}
                    style={styles.modalOption}
                    onPress={() => {
                      setProdutoSelecionado(produto);
                      setModalProdutoVisivel(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>
                      {produto?.nome || "Produto sem nome"}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUsuarioVisivel}
        onRequestClose={() => setModalUsuarioVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Usuário</Text>
              <TouchableOpacity onPress={() => setModalUsuarioVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setUsuarioSelecionado(null);
                  setModalUsuarioVisivel(false);
                }}
              >
                <Text style={styles.modalOptionText}>Todos</Text>
              </TouchableOpacity>
              {(() => {
                const usuariosUnicos = Array.from(
                  new Map(
                    movimentacoes
                      .filter((m) => m.usuario)
                      .map((m) => [m.usuario.id, m.usuario])
                  ).values()
                );
                return usuariosUnicos.map((usuario) => (
                  <TouchableOpacity
                    key={usuario.id}
                    style={styles.modalOption}
                    onPress={() => {
                      setUsuarioSelecionado(usuario);
                      setModalUsuarioVisivel(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>
                      {usuario.nome || "Usuário sem nome"}
                    </Text>
                  </TouchableOpacity>
                ));
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUnidadeVisivel}
        onRequestClose={() => setModalUnidadeVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Unidade</Text>
              <TouchableOpacity onPress={() => setModalUnidadeVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setUnidadeSelecionada(null);
                  setModalUnidadeVisivel(false);
                }}
              >
                <Text style={styles.modalOptionText}>Todas</Text>
              </TouchableOpacity>
              {Array.isArray(unidades) &&
                unidades.map((unidade) => (
                  <TouchableOpacity
                    key={unidade?.id || Math.random()}
                    style={styles.modalOption}
                    onPress={() => {
                      setUnidadeSelecionada(unidade);
                      setModalUnidadeVisivel(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>
                      {unidade?.nome || "Unidade sem nome"}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    width: 80, // Ajustar para caber no espaço do botaoDireita
  },
  addButton: {
    padding: 4,
    marginRight: 8,
  },
  filterButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  movimentacaoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  movimentacaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tipoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipoBadge: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dataText: {
    fontSize: 12,
    color: "#666",
  },
  movimentacaoBody: {
    gap: 4,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  quantidadeText: {
    fontSize: 14,
    color: "#666",
  },
  usuarioText: {
    fontSize: 14,
    color: "#666",
  },
  unidadeText: {
    fontSize: 14,
    color: "#666",
  },
  observacaoText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  documentoText: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterValue: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  clearButtonText: {
    color: "#666",
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
});
