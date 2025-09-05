import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito-sans";
import { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type CadastroMovimentacaoScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "CadastroMovimentacao"
>;

export default function CadastroMovimentacao() {
  const navigation = useNavigation<CadastroMovimentacaoScreenProp>();

  const [fontesLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  const [tipo, setTipo] = useState<
    "ENTRADA" | "SAIDA" | "TRANSFERENCIA" | "AJUSTE"
  >("ENTRADA");
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");
  const [documento, setDocumento] = useState("");

  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [unidadeOrigemSelecionada, setUnidadeOrigemSelecionada] =
    useState<any>(null);
  const [unidadeDestinoSelecionada, setUnidadeDestinoSelecionada] =
    useState<any>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    verificarLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (unidadeOrigemSelecionada) {
      const produtosDaUnidade = produtos.filter(
        (produto) => produto.unidade_id === unidadeOrigemSelecionada.id
      );
      setProdutosFiltrados(produtosDaUnidade);
    } else {
      setProdutosFiltrados(produtos);
    }
    if (produtoSelecionado && unidadeOrigemSelecionada) {
      const produtoAindaDisponivel = produtos.some(
        (produto) =>
          produto.id === produtoSelecionado.id &&
          produto.unidade_id === unidadeOrigemSelecionada.id
      );
      if (!produtoAindaDisponivel) {
        setProdutoSelecionado(null);
      }
    }
  }, [unidadeOrigemSelecionada, produtos, produtoSelecionado]);

  async function verificarLogin() {
    try {
      const token = await AsyncStorage.getItem("token");
      const usuarioString = await AsyncStorage.getItem("usuario");

      if (!token || !usuarioString) {
        Toast.show({
          type: "error",
          text1: "Sessão Expirada",
          text2: "Faça login novamente para continuar.",
          position: "top",
          visibilityTime: 4000,
        });
        return;
      }

      const usuario = JSON.parse(usuarioString);

      if (!usuario.id) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Dados do usuário inválidos. Faça login novamente.",
          position: "top",
          visibilityTime: 4000,
        });
        return;
      }

      setUsuarioId(usuario.id);
      carregarDadosIniciais();
    } catch (error) {
      console.error("Erro ao verificar login:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Erro interno do aplicativo.",
        position: "top",
        visibilityTime: 4000,
      });
    }
  }

  async function carregarDadosIniciais() {
    try {
      setCarregandoDados(true);

      const [responseProdutos, responseUnidades] = await Promise.all([
        api.get("/produtos"),
        api.get("/unidades"),
      ]);

      const produtosAtivos = Array.isArray(responseProdutos.data)
        ? responseProdutos.data.filter(
            (produto: any) => produto.quantidade_estoque > 0
          )
        : [];

      setProdutos(produtosAtivos);
      setProdutosFiltrados(produtosAtivos);
      setUnidades(
        Array.isArray(responseUnidades.data) ? responseUnidades.data : []
      );
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      Toast.show({
        type: "error",
        text1: "Erro de Conexão",
        text2: "Verifique se o backend está rodando e o IP está correto",
        position: "top",
        visibilityTime: 5000,
      });
    } finally {
      setCarregandoDados(false);
    }
  }

  function getTipoTexto(tipo: string) {
    switch (tipo) {
      case "ENTRADA":
        return "Entrada";
      case "SAIDA":
        return "Saída";
      case "TRANSFERENCIA":
        return "Transferência";
      case "AJUSTE":
        return "Ajuste";
      default:
        return tipo;
    }
  }

  function renderProdutoOption(produto: any) {
    const quantidadeEstoque = produto.quantidade_estoque || 0;
    const unidade = quantidadeEstoque === 1 ? "unid." : "unid.";

    return (
      <View style={styles.produtoOptionContainer}>
        <Text style={styles.produtoNome} numberOfLines={1}>
          {produto.nome}
        </Text>
        <Text style={styles.produtoEstoque}>
          — {quantidadeEstoque} {unidade}
        </Text>
      </View>
    );
  }

  async function salvarMovimentacao() {
    if (!unidadeOrigemSelecionada) {
      Toast.show({
        type: "error",
        text1: "Campo obrigatório",
        text2: "Selecione a unidade de origem",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (!produtoSelecionado) {
      Toast.show({
        type: "error",
        text1: "Campo obrigatório",
        text2: "Selecione um produto",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (!quantidade || parseFloat(quantidade) <= 0) {
      Toast.show({
        type: "error",
        text1: "Campo obrigatório",
        text2: "Digite uma quantidade válida",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (tipo === "TRANSFERENCIA" && !unidadeDestinoSelecionada) {
      Toast.show({
        type: "error",
        text1: "Campo obrigatório para transferência",
        text2: "Selecione a unidade de destino",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setSalvando(true);

      const dadosMovimentacao = {
        tipo,
        quantidade: parseFloat(quantidade),
        produto_id: produtoSelecionado.id,
        usuario_id: usuarioId,
        observacao: observacao.trim() || null,
        documento: documento.trim() || null,
        unidade_origem_id: unidadeOrigemSelecionada?.id || null,
        unidade_destino_id: unidadeDestinoSelecionada?.id || null,
      };

      const response = await api.post("/movimentacoes", dadosMovimentacao);

      if (response.status === 201 || response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Sucesso",
          text2: "Movimentação registrada com sucesso",
          position: "top",
          visibilityTime: 3000,
        });

        setTipo("ENTRADA");
        setQuantidade("");
        setObservacao("");
        setDocumento("");
        setProdutoSelecionado(null);
        setUnidadeOrigemSelecionada(null);
        setUnidadeDestinoSelecionada(null);

        await carregarDadosIniciais();

        navigation.goBack();
      } else {
        throw new Error("Resposta inesperada do servidor");
      }
    } catch (error: any) {
      console.error("Erro ao salvar movimentação:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Erro ao registrar movimentação";
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: errorMessage,
          position: "top",
          visibilityTime: 4000,
        });
      } else if (error.request) {
        Toast.show({
          type: "error",
          text1: "Erro de Conexão",
          text2: "Verifique sua conexão com a internet",
          position: "top",
          visibilityTime: 4000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Erro interno do aplicativo",
          position: "top",
          visibilityTime: 4000,
        });
      }
    } finally {
      setSalvando(false);
    }
  }

  if (!fontesLoaded || carregandoDados) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Nova Movimentação</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Select
              label="Tipo de Movimentação"
              placeholder="Selecione o tipo"
              value={tipo ? { id: tipo, nome: getTipoTexto(tipo) } : null}
              options={[
                { id: "ENTRADA", nome: "Entrada" },
                { id: "SAIDA", nome: "Saída" },
                { id: "TRANSFERENCIA", nome: "Transferência" },
                { id: "AJUSTE", nome: "Ajuste" },
              ]}
              onValueChange={(value) =>
                setTipo(value ? (value.id as typeof tipo) : "ENTRADA")
              }
              required
              accessibilityLabel="Selecionar tipo de movimentação"
            />
          </View>

          <View style={styles.inputGroup}>
            <Select
              label="Unidade de Origem"
              placeholder="Selecione a unidade"
              value={unidadeOrigemSelecionada}
              options={unidades}
              onValueChange={setUnidadeOrigemSelecionada}
              required
              searchable
              accessibilityLabel="Selecionar unidade de origem"
            />
          </View>

          <View style={styles.inputGroup}>
            <Select
              label="Produto"
              placeholder={
                unidadeOrigemSelecionada
                  ? "Selecione um produto"
                  : "Selecione primeiro a unidade de origem"
              }
              value={produtoSelecionado}
              options={produtosFiltrados}
              onValueChange={setProdutoSelecionado}
              required
              disabled={!unidadeOrigemSelecionada}
              searchable
              accessibilityLabel="Selecionar produto"
              renderOption={renderProdutoOption}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantidade *</Text>
            <Input
              placeholder="Digite a quantidade"
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
              accessibilityLabel="Campo quantidade"
              accessibilityHint="Digite a quantidade da movimentação"
            />
          </View>

          <View style={styles.inputGroup}>
            <Select
              label="Unidade de Destino"
              placeholder="Selecione a unidade (opcional)"
              value={unidadeDestinoSelecionada}
              options={unidades}
              onValueChange={setUnidadeDestinoSelecionada}
              searchable
              accessibilityLabel="Selecionar unidade de destino"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observação</Text>
            <Input
              placeholder="Digite uma observação (opcional)"
              value={observacao}
              onChangeText={setObservacao}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Documento</Text>
            <Input
              placeholder="Número do documento (opcional)"
              value={documento}
              onChangeText={setDocumento}
            />
          </View>

          <TouchableOpacity
            style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
            onPress={salvarMovimentacao}
            disabled={salvando}
            accessibilityLabel="Salvar movimentação"
            accessibilityRole="button"
          >
            <Text style={styles.textoBotaoSalvar}>
              {salvando ? "Salvando..." : "Salvar Movimentação"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "NunitoSans_400Regular",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "NunitoSans_700Bold",
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    fontFamily: "NunitoSans_600SemiBold",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tipoIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "NunitoSans_400Regular",
  },
  botaoSalvar: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botaoDesabilitado: {
    backgroundColor: "#ccc",
  },
  textoBotaoSalvar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "NunitoSans_600SemiBold",
  },
  selectorDesabilitado: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  produtoOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    color: "#333",
    fontFamily: "NunitoSans_400Regular",
    flex: 1,
  },
  produtoEstoque: {
    fontSize: 14,
    color: "#666",
    fontFamily: "NunitoSans_400Regular",
    marginLeft: 8,
  },
});
