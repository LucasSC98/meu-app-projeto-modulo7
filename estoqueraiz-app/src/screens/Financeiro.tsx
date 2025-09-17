import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import Toast from "react-native-toast-message";
import { Input } from "../components/Input";
import Header from "../components/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  quantidade_estoque: number;
  preco_custo?: number;
  preco_venda?: number;
  statusProduto: string;
  categoria: { nome: string };
  unidade: { nome: string };
  usuario: { nome: string; cargo: string };
  criado_em: string;
}

export default function ProdutosFinanceiro() {
  const navegacao =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [produtosTodos, setProdutosTodos] = useState<Produto[]>([]);
  const [produtosPendentes, setProdutosPendentes] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"todos" | "pendentes">("pendentes"); // Aba "Pendentes" ativa por padrão
  const [precosEditando, setPrecosEditando] = useState<{
    [key: number]: { custo: string; venda: string };
  }>({});
  const [precosEditandoTodos, setPrecosEditandoTodos] = useState<{
    [key: number]: { custo: string; venda: string };
  }>({});

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setCarregando(true);
      // Carregar todos os produtos (conforme hierarquia)
      const respostaTodos = await api.get("/produtos");
      setProdutosTodos(respostaTodos.data);

      // Carregar produtos pendentes
      const respostaPendentes = await api.get("/produtos/pendentes");
      setProdutosPendentes(respostaPendentes.data);
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro desconhecido ao carregar produtos";
      console.error("Erro ao carregar produtos:", error.response?.data);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: mensagemErro,
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setCarregando(false);
    }
  }

  async function aprovarProduto(produtoId: number) {
    const precos = precosEditando[produtoId];
    if (!precos || !precos.custo || !precos.venda) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Preencha os preços antes de aprovar",
        position: "top",
        visibilityTime: 4000,
      });
      return;
    }

    try {
      await api.patch(`/produtos/${produtoId}/aprovar`, {
        preco_custo: parseFloat(precos.custo),
        preco_venda: parseFloat(precos.venda),
      });

      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Produto aprovado com preços",
        position: "top",
        visibilityTime: 3000,
      });

      carregarProdutos();
    } catch (error: any) {
      console.error("Erro ao aprovar produto:", error.response?.data);
      const mensagem =
        error.response?.data?.message || "Erro ao aprovar produto";
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: mensagem,
        position: "top",
        visibilityTime: 4000,
      });
    }
  }

  async function atualizarPrecosProduto(produtoId: number) {
    const precos = precosEditandoTodos[produtoId];
    if (!precos || !precos.custo || !precos.venda) {
      Alert.alert("Erro", "Preencha os preços antes de salvar");
      return;
    }

    try {
      await api.patch(`/produtos/${produtoId}`, {
        preco_custo: parseFloat(precos.custo),
        preco_venda: parseFloat(precos.venda),
      });

      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Preços atualizados",
        position: "top",
        visibilityTime: 3000,
      });

      setPrecosEditandoTodos((prev) => {
        const novosPrecos = { ...prev };
        delete novosPrecos[produtoId];
        return novosPrecos;
      });
      carregarProdutos();
    } catch (error: any) {
      console.error("Erro ao atualizar preços:", error.response?.data);
      const mensagem =
        error.response?.data?.message || "Erro ao atualizar preços";
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: mensagem,
        position: "top",
        visibilityTime: 4000,
      });
    }
  }

  function iniciarEdicao(produtoId: number) {
    setPrecosEditando({
      ...precosEditando,
      [produtoId]: { custo: "", venda: "" },
    });
  }

  function iniciarEdicaoTodos(
    produtoId: number,
    custoAtual: number,
    vendaAtual: number
  ) {
    setPrecosEditandoTodos({
      ...precosEditandoTodos,
      [produtoId]: {
        custo: custoAtual.toString(),
        venda: vendaAtual.toString(),
      },
    });
  }

  function atualizarPreco(
    produtoId: number,
    tipo: "custo" | "venda",
    valor: string
  ) {
    setPrecosEditando({
      ...precosEditando,
      [produtoId]: {
        ...precosEditando[produtoId],
        [tipo]: valor,
      },
    });
  }

  function atualizarPrecoTodos(
    produtoId: number,
    tipo: "custo" | "venda",
    valor: string
  ) {
    setPrecosEditandoTodos({
      ...precosEditandoTodos,
      [produtoId]: {
        ...precosEditandoTodos[produtoId],
        [tipo]: valor,
      },
    });
  }

  const produtosAtivos =
    abaAtiva === "todos" ? produtosTodos : produtosPendentes;

  if (carregando) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        titulo="Financeiro"
        subtitulo={
          abaAtiva === "pendentes"
            ? `${produtosPendentes.length} produto(s) pendente(s)`
            : `${produtosTodos.length} produto(s) total`
        }
        onPressVoltar={() => navegacao.goBack()}
        botaoDireita={
          <View style={styles.headerIcone}>
            <View style={styles.iconeCirculo}>
              <MaterialIcons name="attach-money" size={28} color="#059669" />
            </View>
          </View>
        }
      />

      {/* Abas movidas para baixo do header */}
      <View style={styles.abasContainer}>
        <TouchableOpacity
          style={[styles.aba, abaAtiva === "pendentes" && styles.abaAtiva]}
          onPress={() => setAbaAtiva("pendentes")}
        >
          <Text
            style={[
              styles.textoAba,
              abaAtiva === "pendentes" && styles.textoAbaAtiva,
            ]}
          >
            Pendentes
          </Text>
          {produtosPendentes.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{produtosPendentes.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.aba, abaAtiva === "todos" && styles.abaAtiva]}
          onPress={() => setAbaAtiva("todos")}
        >
          <Text
            style={[
              styles.textoAba,
              abaAtiva === "todos" && styles.textoAbaAtiva,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
      </View>

      {produtosAtivos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle" size={64} color="#10b981" />
          <Text style={styles.emptyText}>
            {abaAtiva === "todos"
              ? "Nenhum produto encontrado"
              : "Nenhum produto pendente"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={produtosAtivos}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.produtoCard}>
              <View style={styles.produtoHeader}>
                <Text style={styles.produtoNome}>{item.nome}</Text>
                <Text style={styles.produtoEstoque}>
                  Estoque: {item.quantidade_estoque}
                </Text>
              </View>

              <Text style={styles.produtoInfo}>
                Categoria: {item.categoria?.nome}
              </Text>
              <Text style={styles.produtoInfo}>
                Unidade: {item.unidade?.nome}
              </Text>
              <Text style={styles.produtoInfo}>
                Cadastrado por: {item.usuario?.nome} ({item.usuario?.cargo})
              </Text>
              <Text style={styles.produtoInfo}>
                Data: {new Date(item.criado_em).toLocaleDateString("pt-BR")}
              </Text>

              {/* Mostrar preços apenas na aba "Todos" */}
              {abaAtiva === "todos" && (
                <>
                  <Text style={styles.produtoInfo}>
                    Preço Custo:{" "}
                    {item.preco_custo !== null &&
                    item.preco_custo !== undefined &&
                    !isNaN(Number(item.preco_custo))
                      ? `R$ ${Number(item.preco_custo).toFixed(2)}`
                      : "Não definido"}
                  </Text>
                  <Text style={styles.produtoInfo}>
                    Preço Venda:{" "}
                    {item.preco_venda !== null &&
                    item.preco_venda !== undefined &&
                    !isNaN(Number(item.preco_venda))
                      ? `R$ ${Number(item.preco_venda).toFixed(2)}`
                      : "Não definido"}
                  </Text>
                  <Text style={styles.produtoInfo}>
                    Status:{" "}
                    {item.statusProduto === "aprovado"
                      ? "Aprovado"
                      : "Pendente"}
                  </Text>

                  {/* Edição de preços na aba "Todos" para produtos aprovados */}
                  {item.statusProduto === "aprovado" &&
                    (precosEditandoTodos[item.id] ? (
                      <View style={styles.precosContainer}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Preço de Custo *</Text>
                          <Input
                            placeholder="Ex: 35.90"
                            value={precosEditandoTodos[item.id].custo}
                            onChangeText={(valor) =>
                              atualizarPrecoTodos(item.id, "custo", valor)
                            }
                            keyboardType="numeric"
                            style={styles.input}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Preço de Venda *</Text>
                          <Input
                            placeholder="Ex: 49.90"
                            value={precosEditandoTodos[item.id].venda}
                            onChangeText={(valor) =>
                              atualizarPrecoTodos(item.id, "venda", valor)
                            }
                            keyboardType="numeric"
                            style={styles.input}
                          />
                        </View>

                        <View style={styles.botoesContainer}>
                          <TouchableOpacity
                            style={styles.botaoAprovar}
                            onPress={() => atualizarPrecosProduto(item.id)}
                          >
                            <Text style={styles.botaoTexto}>Salvar</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.botaoCancelar}
                            onPress={() => {
                              const novosPrecos = { ...precosEditandoTodos };
                              delete novosPrecos[item.id];
                              setPrecosEditandoTodos(novosPrecos);
                            }}
                          >
                            <Text style={styles.botaoTextoCancelar}>
                              Cancelar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.botaoEditar}
                        onPress={() =>
                          iniciarEdicaoTodos(
                            item.id,
                            Number(item.preco_custo) || 0,
                            Number(item.preco_venda) || 0
                          )
                        }
                      >
                        <MaterialIcons name="edit" size={20} color="#2196F3" />
                        <Text style={styles.botaoEditarTexto}>
                          Editar Preços
                        </Text>
                      </TouchableOpacity>
                    ))}
                </>
              )}

              {/* Edição de preços apenas na aba "Pendentes" */}
              {abaAtiva === "pendentes" &&
                (precosEditando[item.id] ? (
                  <View style={styles.precosContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Preço de Custo *</Text>
                      <Input
                        placeholder="Ex: 35.90"
                        value={precosEditando[item.id].custo}
                        onChangeText={(valor) =>
                          atualizarPreco(item.id, "custo", valor)
                        }
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Preço de Venda *</Text>
                      <Input
                        placeholder="Ex: 49.90"
                        value={precosEditando[item.id].venda}
                        onChangeText={(valor) =>
                          atualizarPreco(item.id, "venda", valor)
                        }
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>

                    <View style={styles.botoesContainer}>
                      <TouchableOpacity
                        style={styles.botaoAprovar}
                        onPress={() => aprovarProduto(item.id)}
                      >
                        <Text style={styles.botaoTexto}>Aprovar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.botaoCancelar}
                        onPress={() => {
                          const novosPrecos = { ...precosEditando };
                          delete novosPrecos[item.id];
                          setPrecosEditando(novosPrecos);
                        }}
                      >
                        <Text style={styles.botaoTextoCancelar}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.botaoEditar}
                    onPress={() => iniciarEdicao(item.id)}
                  >
                    <MaterialIcons name="edit" size={20} color="#2196F3" />
                    <Text style={styles.botaoEditarTexto}>Definir Preços</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // ÍCONE DO HEADER
  headerIcone: {
    alignItems: "center",
  },
  iconeCirculo: {
    width: 40,
    height: 40,
    backgroundColor: "#ecfdf5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },

  // ABAS MOVIDAS PARA FORA DO HEADER
  abasContainer: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  aba: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },
  abaAtiva: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    paddingHorizontal: 2,
    minWidth: 0,
  },
  textoAba: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
  },
  textoAbaAtiva: {
    color: "#ffffff",
  },
  badgeContainer: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    position: "absolute",
    top: -6,
    right: -6,
    zIndex: 10,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "NunitoSans_700Bold",
  },

  // RESTANTE DOS ESTILOS (cards, loading, etc.)
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  produtoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  produtoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
    color: "#111827",
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  produtoEstoque: {
    fontSize: 14,
    color: "#10b981",
    fontFamily: "NunitoSans_600SemiBold",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  produtoInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    fontFamily: "NunitoSans_400Regular",
    lineHeight: 20,
  },
  precosContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
    color: "#111827",
  },
  botoesContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  botaoAprovar: {
    flex: 1,
    backgroundColor: "#10b981",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoCancelar: {
    flex: 1,
    backgroundColor: "#6B7280",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
  },
  botaoTextoCancelar: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
  },
  botaoEditar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  botaoEditarTexto: {
    fontSize: 16,
    color: "#2196F3",
    fontFamily: "NunitoSans_600SemiBold",
  },
});
