import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

export default function PainelControle() {
  const navegacao =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<any>(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  const [totalProdutos, setTotalProdutos] = useState(0);
  const [produtosVencendo, setProdutosVencendo] = useState(0);
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState<any[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    async function carregarDadosUsuario() {
      const nome = await AsyncStorage.getItem("nome");
      setNomeUsuario(nome);
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

  const selecionarUnidade = (unidade: any) => {
    setUnidadeSelecionada(unidade);
    setModalVisivel(false);
    carregarDadosUnidade(unidade.id);
  };

  return (
    <ScrollView
      style={estilos.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={estilos.cabecalho}>
        <Text style={estilos.tituloCabecalho}>Sistema WMS</Text>
        <Text style={estilos.subtituloCabecalho}>Controle de Estoque</Text>
        {nomeUsuario ? (
          <Text style={estilos.mensagemBoasVindas}>
            Bem-vindo, {nomeUsuario}!
          </Text>
        ) : (
          <Text style={estilos.mensagemBoasVindas}>Carregando...</Text>
        )}
      </View>

      <View style={{ marginHorizontal: 20, marginTop: 16 }}>
        <Text style={estilos.tituloSecao}>Unidade</Text>
        {Platform.OS === "ios" ? (
          <>
            <TouchableOpacity
              style={estilos.containerSeletor}
              onPress={() => setModalVisivel(true)}
            >
              <Text style={estilos.textoSeletor}>
                {unidadeSelecionada
                  ? unidadeSelecionada.nome
                  : unidades.length > 0
                  ? "Selecione uma unidade"
                  : "Carregando..."}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisivel}
              onRequestClose={() => setModalVisivel(false)}
            >
              <View style={estilos.containerModal}>
                <View style={estilos.conteudoModal}>
                  <View style={estilos.cabecalhoModal}>
                    <Text style={estilos.tituloModal}>Selecionar Unidade</Text>
                    <TouchableOpacity onPress={() => setModalVisivel(false)}>
                      <MaterialIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {unidades.map((unidade) => (
                      <TouchableOpacity
                        key={unidade.id}
                        style={[
                          estilos.opcaoModal,
                          unidade.id === unidadeSelecionada?.id &&
                            estilos.opcaoModalSelecionada,
                        ]}
                        onPress={() => selecionarUnidade(unidade)}
                      >
                        <Text
                          style={[
                            estilos.textoOpcaoModal,
                            unidade.id === unidadeSelecionada?.id &&
                              estilos.textoOpcaoModalSelecionada,
                          ]}
                        >
                          {unidade.nome}
                        </Text>
                        {unidade.id === unidadeSelecionada?.id && (
                          <MaterialIcons
                            name="check"
                            size={20}
                            color="#2196F3"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <View style={estilos.containerSeletor}>
            <Picker
              selectedValue={unidadeSelecionada?.id || ""}
              onValueChange={(val) => {
                if (val && val !== "") {
                  const unidade = unidades.find((u) => u.id === val);
                  if (unidade) {
                    setUnidadeSelecionada(unidade);
                    carregarDadosUnidade(unidade.id);
                  }
                } else {
                  setUnidadeSelecionada(null);
                }
              }}
              style={estilos.seletor}
              mode="dropdown"
            >
              <Picker.Item
                label={
                  unidades.length > 0
                    ? "Selecione uma unidade"
                    : "Carregando..."
                }
                value=""
              />
              {unidades.map((unidade) => (
                <Picker.Item
                  key={unidade.id}
                  label={unidade.nome}
                  value={unidade.id}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      <View style={estilos.containerResumo}>
        <View style={[estilos.cartaoResumo, { backgroundColor: "#E3F2FD" }]}>
          <MaterialIcons name="inventory" size={24} color="#2196F3" />
          <Text style={estilos.valorCartao}>
            {carregandoDados ? "..." : totalProdutos}
          </Text>
          <Text style={estilos.tituloCartao}>Total de Produtos</Text>
        </View>
        <View style={[estilos.cartaoResumo, { backgroundColor: "#FFEBEE" }]}>
          <MaterialIcons name="warning" size={24} color="#F44336" />
          <Text style={estilos.valorCartao}>
            {carregandoDados ? "..." : produtosVencendo}
          </Text>
          <Text style={estilos.tituloCartao}>Produtos Vencendo</Text>
        </View>
      </View>

      <View style={estilos.cartaoABC}>
        <Text style={estilos.tituloSecao}>Curva ABC</Text>
        <Text style={estilos.textoSemDados}>Nenhum dado disponível</Text>
      </View>

      <View style={estilos.secao}>
        <View style={estilos.cabecalhoSecao}>
          <MaterialIcons name="warning" size={20} color="#F44336" />
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
          <MaterialIcons name="file-download" size={20} color="#0a0a0aff" />
          <Text style={[estilos.textoBotao, { color: "#000000ff" }]}>
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
            <MaterialIcons name="inventory" size={32} color="#2196F3" />
            <Text style={estilos.textoNavegacaoRapida}>Lista de Produtos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.itemNavegacaoRapida}
            onPress={() => navegacao.navigate("CadastroProduto")}
          >
            <MaterialIcons name="add-box" size={32} color="#4CAF50" />
            <Text style={estilos.textoNavegacaoRapida}>Novo Produto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.itemNavegacaoRapida}
            onPress={() => navegacao.navigate("CadastroCategoria")}
          >
            <MaterialIcons name="category" size={32} color="#FF9800" />
            <Text style={estilos.textoNavegacaoRapida}>
              Cadastro de Categorias
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={estilos.itemNavegacaoRapida}
            onPress={() => navegacao.navigate("CadastroUnidade")}
          >
            <MaterialIcons name="location-on" size={32} color="#0d0d0dff" />
            <Text style={estilos.textoNavegacaoRapida}>
              Cadastro de Unidades
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  cabecalho: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tituloCabecalho: { fontSize: 24, fontWeight: "bold", color: "#333" },
  subtituloCabecalho: { fontSize: 14, color: "#666", marginTop: 2 },
  mensagemBoasVindas: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222822ff",
    marginTop: 10,
  },

  containerSeletor: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 8,
    overflow: "hidden",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  seletor: {
    backgroundColor: "#fff",
    color: "#333",
    height: 50,
  },
  textoSeletor: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  containerModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  conteudoModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  cabecalhoModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  opcaoModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  opcaoModalSelecionada: {
    backgroundColor: "#f0f8ff",
  },
  textoOpcaoModal: {
    fontSize: 16,
    color: "#333",
  },
  textoOpcaoModalSelecionada: {
    color: "#2196F3",
    fontWeight: "500",
  },

  containerResumo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  cartaoResumo: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  valorCartao: { fontSize: 24, fontWeight: "bold", color: "#333" },
  tituloCartao: { fontSize: 12, color: "#666", fontWeight: "500" },
  cartaoABC: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  secao: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cabecalhoSecao: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tituloSecao: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  cartaoProduto: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  nomeProduto: { fontSize: 14, fontWeight: "500", color: "#333" },
  detalhesProduto: { fontSize: 12, color: "#666", marginBottom: 2 },
  botoesAcao: { paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  botaoAcao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  botaoPrimario: { backgroundColor: "#0b0b0bff" },
  botaoSecundario: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#101213ff",
  },
  textoBotao: { fontSize: 14, fontWeight: "500", color: "#fff" },
  navegacaoRapida: { paddingHorizontal: 20, paddingBottom: 30 },
  gradeNavegacaoRapida: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  itemNavegacaoRapida: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoNavegacaoRapida: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  textoSemDados: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});
