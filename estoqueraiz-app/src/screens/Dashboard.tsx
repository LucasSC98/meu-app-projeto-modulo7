import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import LogoAgrologica from "../assets/images/logo.png";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

export default function PainelControle() {
  const navegacao =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
  const [iniciaisUsuario, setIniciaisUsuario] = useState<string>("");
  const [cargoUsuario, setCargoUsuario] = useState<string>("Carregando...");
  const [unidades, setUnidades] = useState<any[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<any>(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  const [totalProdutos, setTotalProdutos] = useState(0);
  const [produtosVencendo, setProdutosVencendo] = useState(0);
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState<any[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const obterIniciais = (nomeCompleto: string): string => {
    const nomes = nomeCompleto.trim().split(" ");
    if (nomes.length >= 2) {
      return (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase();
    }
    return nomes[0] ? nomes[0][0].toUpperCase() : "";
  };

  const formatarCargo = (cargo: string): string => {
    const cargos: { [key: string]: string } = {
      gerente: "Gerente",
      estoquista: "Estoquista",
      financeiro: "Financeiro",
    };
    return cargos[cargo] || cargo;
  };

  useEffect(() => {
    async function carregarDadosUsuario() {
      const nome = await AsyncStorage.getItem("nome");
      const cargo = await AsyncStorage.getItem("cargo");
      setNomeUsuario(nome);
      setCargoUsuario(cargo ? formatarCargo(cargo) : "Usuário");
      if (nome) {
        setIniciaisUsuario(obterIniciais(nome));
      }
    }
    carregarDadosUsuario();
  }, []);

  useEffect(() => {
    carregarDadosDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarDadosDashboard() {
    try {
      setCarregandoDados(true);

      const responseUnidades = await api.get("/unidades");
      const unidadesData = responseUnidades.data;
      setUnidades(unidadesData);

      if (unidadesData.length > 0 && !unidadeSelecionada) {
        setUnidadeSelecionada(unidadesData[0]);
        await carregarDadosUnidade(unidadesData[0].id);
        return;
      }

      const responseProdutos = await api.get("/produtos");
      const produtos = responseProdutos.data;
      setTotalProdutos(produtos.length);

      const hoje = new Date();
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      const produtosVencendoCount = produtos.filter((produto: any) => {
        if (!produto.data_validade) return false;
        const dataValidade = new Date(produto.data_validade);
        return dataValidade <= em30Dias && dataValidade >= hoje;
      }).length;

      setProdutosVencendo(produtosVencendoCount);

      const responseEstoqueBaixo = await api.get("/produtos/estoque/baixo");
      setProdutosEstoqueBaixo(responseEstoqueBaixo.data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setCarregandoDados(false);
    }
  }

  async function carregarDadosUnidade(unidadeId: number) {
    try {
      setCarregandoDados(true);

      const responseProdutos = await api.get(`/produtos/unidade/${unidadeId}`);
      const produtos = responseProdutos.data;
      setTotalProdutos(produtos.length);

      const hoje = new Date();
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      const produtosVencendoCount = produtos.filter((produto: any) => {
        if (!produto.data_validade) return false;
        const dataValidade = new Date(produto.data_validade);
        return dataValidade <= em30Dias && dataValidade >= hoje;
      }).length;

      setProdutosVencendo(produtosVencendoCount);

      const responseEstoqueBaixo = await api.get("/produtos/estoque/baixo");
      const produtosBaixoUnidade = responseEstoqueBaixo.data.filter(
        (produto: any) => produto.unidade_id === unidadeId
      );
      setProdutosEstoqueBaixo(produtosBaixoUnidade);
    } catch (error) {
      console.error("Erro ao carregar dados da unidade:", error);
    } finally {
      setCarregandoDados(false);
    }
  }

  return (
    <ScrollView
      style={estilos.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={estilos.header}>
        <View style={estilos.containerLogo}>
          <Image
            source={LogoAgrologica}
            style={estilos.logoHeader}
            resizeMode="contain"
          />
        </View>

        <View style={estilos.areaCentral}>
          <View style={estilos.containerTitulo}>
            <Text style={estilos.tituloPrincipal}>
              Controle{"\n"}de{"\n"}Estoque
            </Text>
            <View style={estilos.divisor} />
            <Text style={estilos.subtitulo}>Sistema de Gestão</Text>
          </View>
        </View>

        <View style={estilos.containerUsuario}>
          {nomeUsuario ? (
            <>
              <View style={estilos.infoUsuario}>
                <Text
                  style={estilos.nomeUsuarioHeader}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {nomeUsuario}
                </Text>
                <Text
                  style={estilos.cargoUsuarioHeader}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cargoUsuario}
                </Text>
              </View>
              <View style={estilos.avatarUsuario}>
                <Text style={estilos.iniciaisUsuario}>{iniciaisUsuario}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={estilos.infoUsuario}>
                <Text
                  style={estilos.nomeUsuarioHeader}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Carregando...
                </Text>
                <Text
                  style={estilos.cargoUsuarioHeader}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Usuário
                </Text>
              </View>
              <View style={estilos.avatarUsuario}>
                <Text style={estilos.iniciaisUsuario}>?</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={{ marginHorizontal: 24, marginTop: 32 }}>
        <View style={estilos.secaoHeader}>
          <MaterialIcons name="location-on" size={20} color="#059669" />
          <Text style={estilos.tituloSecao}>Unidade Selecionada</Text>
        </View>

        <TouchableOpacity
          style={estilos.containerSeletor}
          onPress={() => setModalVisivel(true)}
          activeOpacity={0.8}
        >
          <View style={estilos.conteudoSeletor}>
            <View style={estilos.iconeSeletor}>
              <MaterialIcons
                name="warehouse"
                size={15}
                color={unidadeSelecionada ? "#059669" : "#94a3b8"}
              />
            </View>
            <View style={estilos.textoContainer}>
              <Text
                style={[
                  estilos.textoSeletor,
                  !unidadeSelecionada && estilos.textoSeletorPlaceholder,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {unidadeSelecionada
                  ? unidadeSelecionada.nome
                  : unidades.length > 0
                  ? "Selecione uma unidade"
                  : "Carregando unidades..."}
              </Text>
            </View>
            <MaterialIcons name="expand-more" size={24} color="#64748b" />
          </View>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisivel}
          onRequestClose={() => setModalVisivel(false)}
        >
          <View style={estilos.containerModal}>
            <TouchableOpacity
              style={estilos.overlayModal}
              activeOpacity={1}
              onPress={() => setModalVisivel(false)}
            />
            <View style={estilos.conteudoModal}>
              <View style={estilos.cabecalhoModal}>
                <View style={estilos.tituloModalContainer}>
                  <MaterialIcons name="warehouse" size={24} color="#059669" />
                  <Text style={estilos.tituloModal}>Selecionar Unidade</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisivel(false)}
                  style={estilos.botaoFecharModal}
                >
                  <MaterialIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={estilos.separadorModal} />

              <ScrollView
                style={estilos.listaUnidades}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity
                  style={[
                    estilos.itemUnidade,
                    !unidadeSelecionada && estilos.itemUnidadeSelecionado,
                  ]}
                  onPress={() => {
                    setUnidadeSelecionada(null);
                    setModalVisivel(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={estilos.iconeItemContainer}>
                    <MaterialIcons
                      name="grid-view"
                      size={20}
                      color={!unidadeSelecionada ? "#059669" : "#64748b"}
                    />
                  </View>
                  <View style={estilos.conteudoItem}>
                    <Text
                      style={[
                        estilos.nomeUnidade,
                        !unidadeSelecionada && estilos.nomeUnidadeSelecionado,
                      ]}
                    >
                      Todas as unidades
                    </Text>
                    <Text style={estilos.descricaoItem}>
                      Visualizar dados de todas as filiais
                    </Text>
                  </View>
                  {!unidadeSelecionada && (
                    <View style={estilos.indicadorSelecionado}>
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color="#059669"
                      />
                    </View>
                  )}
                </TouchableOpacity>

                {unidades.map((unidade) => (
                  <TouchableOpacity
                    key={unidade.id}
                    style={[
                      estilos.itemUnidade,
                      unidadeSelecionada?.id === unidade.id &&
                        estilos.itemUnidadeSelecionado,
                    ]}
                    onPress={() => {
                      setUnidadeSelecionada(unidade);
                      carregarDadosUnidade(unidade.id);
                      setModalVisivel(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={estilos.iconeItemContainer}>
                      <MaterialIcons
                        name="warehouse"
                        size={15}
                        color={
                          unidadeSelecionada?.id === unidade.id
                            ? "#059669"
                            : "#64748b"
                        }
                      />
                    </View>
                    <View style={estilos.conteudoItem}>
                      <Text
                        style={[
                          estilos.nomeUnidade,
                          unidadeSelecionada?.id === unidade.id &&
                            estilos.nomeUnidadeSelecionado,
                        ]}
                      >
                        {unidade.nome}
                      </Text>
                      <Text style={estilos.descricaoItem}>
                        {unidade.cidade
                          ? `${unidade.cidade}, ${unidade.estado}`
                          : "Filial cadastrada"}
                      </Text>
                    </View>
                    {unidadeSelecionada?.id === unidade.id && (
                      <View style={estilos.indicadorSelecionado}>
                        <MaterialIcons
                          name="check-circle"
                          size={20}
                          color="#059669"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>

      <View style={estilos.containerResumo}>
        <View style={estilos.cartaoResumo}>
          <View style={[estilos.iconeCartao, { backgroundColor: "#eff6ff" }]}>
            <MaterialIcons name="inventory-2" size={20} color="#2563eb" />
          </View>
          <View style={estilos.conteudoCartao}>
            <Text style={estilos.valorCartao}>
              {carregandoDados ? "..." : totalProdutos}
            </Text>
            <Text style={estilos.tituloCartao}>Total de Produtos</Text>
            <Text style={estilos.subtituloCartao}>Itens cadastrados</Text>
          </View>
        </View>

        <View style={estilos.cartaoResumo}>
          <View style={[estilos.iconeCartao, { backgroundColor: "#fef2f2" }]}>
            <MaterialIcons name="schedule" size={20} color="#dc2626" />
          </View>
          <View style={estilos.conteudoCartao}>
            <Text style={estilos.valorCartao}>
              {carregandoDados ? "..." : produtosVencendo}
            </Text>
            <Text style={estilos.tituloCartao}>Produtos Vencendo</Text>
            <Text style={estilos.subtituloCartao}>Próximos ao vencimento</Text>
          </View>
        </View>
      </View>

      <View style={estilos.cartaoABC}>
        <View style={estilos.cabecalhoSecao}>
          <MaterialIcons name="analytics" size={20} color="#059669" />
          <Text style={estilos.tituloSecao}>Curva ABC</Text>
        </View>
        <View style={estilos.conteudoSemDados}>
          <MaterialIcons name="bar-chart" size={32} color="#94a3b8" />
          <Text style={estilos.textoSemDados}>Nenhum dado disponível</Text>
          <Text style={estilos.subtextoSemDados}>
            Análise será exibida quando houver vendas registradas
          </Text>
        </View>
      </View>

      <View style={estilos.secao}>
        <View style={estilos.cabecalhoSecao}>
          <MaterialIcons name="trending-down" size={20} color="#dc2626" />
          <Text style={estilos.tituloSecao}>Produtos com Estoque Baixo</Text>
        </View>
        {carregandoDados ? (
          <View style={estilos.cartaoProduto}>
            <Text style={estilos.nomeProduto}>Carregando...</Text>
          </View>
        ) : produtosEstoqueBaixo.length > 0 ? (
          produtosEstoqueBaixo.slice(0, 3).map((produto) => (
            <View key={produto.id} style={estilos.cartaoProduto}>
              <Text style={estilos.nomeProduto}>{produto.nome}</Text>
              <Text style={estilos.detalhesProduto}>
                Estoque: {produto.quantidade_estoque} • Mínimo:{" "}
                {produto.quantidade_minima}
              </Text>
              {produto.categoria && (
                <Text style={estilos.detalhesProduto}>
                  Categoria: {produto.categoria.nome}
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={estilos.cartaoProduto}>
            <Text style={estilos.nomeProduto}>
              Nenhum produto com estoque baixo
            </Text>
          </View>
        )}
      </View>

      <View style={estilos.botoesAcao}>
        <TouchableOpacity style={[estilos.botaoAcao, estilos.botaoPrimario]}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={estilos.textoBotao}>Nova Movimentação</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[estilos.botaoAcao, estilos.botaoSecundario]}>
          <MaterialIcons name="file-download" size={20} color="#059669" />
          <Text style={[estilos.textoBotao, { color: "#059669" }]}>
            Exportar Dados
          </Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.navegacaoRapida}>
        <Text style={estilos.tituloSecao}>Acesso Rápido</Text>
        <View style={estilos.gradeNavegacaoRapida}>
          <TouchableOpacity
            style={estilos.itemNavegacaoRapida}
            onPress={() => navegacao.navigate("ListaProdutos")}
          >
            <MaterialIcons name="inventory" size={36} color="#3b82f6" />
            <Text style={estilos.textoNavegacaoRapida}>Lista de Produtos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.itemNavegacaoRapida}
            onPress={() => navegacao.navigate("CadastroProduto")}
          >
            <MaterialIcons name="add-box" size={36} color="#059669" />
            <Text style={estilos.textoNavegacaoRapida}>Novo Produto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.itemNavegacaoRapida}
            onPress={() => navegacao.navigate("CadastroCategoria")}
          >
            <MaterialIcons name="category" size={36} color="#f59e0b" />
            <Text style={estilos.textoNavegacaoRapida}>
              Cadastro de Categorias
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.itemNavegacaoRapida}
            onPress={() => navegacao.navigate("MapaUnidades")}
          >
            <MaterialIcons name="location-on" size={36} color="#8b5cf6" />
            <Text style={estilos.textoNavegacaoRapida}>Unidades</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: "relative",
    overflow: "hidden",
  },

  containerLogo: {
    position: "absolute",
    left: 12,
    top: 50,
    bottom: 24,
    justifyContent: "center",
    alignItems: "flex-start",
    minWidth: 100,
    backgroundColor: "transparent",
  },

  logoHeader: {
    width: 60,
    height: 38,
    backgroundColor: "transparent",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  areaCentral: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 130,
  },

  containerTitulo: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    maxWidth: 120,
  },

  tituloPrincipal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.05)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    width: 100,
  },

  divisor: {
    width: 50,
    height: 3,
    backgroundColor: "#059669",
    marginVertical: 6,
    borderRadius: 2,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },

  subtitulo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 13,
    letterSpacing: 0.2,
  },

  containerUsuario: {
    position: "absolute",
    right: 12,
    top: 50,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 100,
  },

  infoUsuario: {
    alignItems: "flex-end",
    marginRight: 12,
    maxWidth: 85,
    paddingVertical: 2,
  },

  nomeUsuarioHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "right",
    lineHeight: 14,
    textShadowColor: "rgba(0, 0, 0, 0.05)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  cargoUsuarioHeader: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "right",
    marginTop: 2,
    lineHeight: 12,
    opacity: 0.8,
  },

  avatarUsuario: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  iniciaisUsuario: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  containerSeletor: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginTop: 1,
    overflow: "hidden",
    minHeight: 54,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  conteudoSeletor: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 54,
    gap: 12,
  },

  textoSeletor: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },

  textoSeletorPlaceholder: {
    color: "#94a3b8",
    fontWeight: "400",
  },

  containerModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  overlayModal: {
    flex: 1,
  },

  conteudoModal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: 34,
  },

  cabecalhoModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  tituloModal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },

  botaoFecharModal: {
    padding: 4,
  },

  listaUnidades: {
    maxHeight: 400,
  },

  itemUnidade: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 12,
    minHeight: 60, // Altura mínima para evitar cortes
  },

  itemUnidadeSelecionado: {
    backgroundColor: "#f0fdf4",
    borderBottomColor: "#bbf7d0",
  },

  nomeUnidade: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
    lineHeight: 18, // Melhor espaçamento do texto
  },

  nomeUnidadeSelecionado: {
    color: "#059669",
    fontWeight: "600",
  },

  containerResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },

  cartaoResumo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    minHeight: 80,
  },

  valorCartao: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
    lineHeight: 20,
  },

  tituloCartao: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "600",
    lineHeight: 14,
  },

  cartaoABC: {
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 6,
    alignItems: "center",
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },

  secao: {
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  cabecalhoSecao: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  tituloSecao: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginLeft: 12,
    letterSpacing: 0.3,
  },

  cartaoProduto: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },

  nomeProduto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },

  detalhesProduto: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 3,
    lineHeight: 18,
  },

  botoesAcao: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },

  botaoAcao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    marginBottom: 0,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  botaoPrimario: {
    backgroundColor: "#059669",
  },

  botaoSecundario: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#059669",
  },

  textoBotao: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.3,
  },

  navegacaoRapida: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  gradeNavegacaoRapida: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 16,
  },

  itemNavegacaoRapida: {
    width: "47%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 0,
    elevation: 6,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },

  textoNavegacaoRapida: {
    fontSize: 13,
    color: "#1e293b",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
    lineHeight: 18,
  },

  textoSemDados: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },

  secaoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  iconeSeletor: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },

  textoContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 4, // Padding vertical para melhor espaçamento
  },

  tituloModalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  separadorModal: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 20,
  },

  iconeItemContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },

  conteudoItem: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 4, // Padding para melhor espaçamento vertical
  },

  descricaoItem: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 16, // Melhor espaçamento
  },

  indicadorSelecionado: {
    marginLeft: 8,
  },

  iconeCartao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  conteudoCartao: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  subtituloCartao: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 1,
    lineHeight: 12,
  },

  conteudoSemDados: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },

  subtextoSemDados: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
  },
});
