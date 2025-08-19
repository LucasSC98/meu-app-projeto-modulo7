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
  Modal,
  Image,
  ActionSheetIOS,
} from "react-native";
import { Input } from "../components/Input";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

export default function CadastroProduto() {
  const [fontesLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [lote, setLote] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [imagemLocal, setImagemLocal] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<any>(null);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<any>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [modalCategoriaVisivel, setModalCategoriaVisivel] = useState(false);
  const [modalUnidadeVisivel, setModalUnidadeVisivel] = useState(false);
  const [modalImagemVisivel, setModalImagemVisivel] = useState(false);
  const [modalUrlVisivel, setModalUrlVisivel] = useState(false);

  useEffect(() => {
    verificarLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        text2: "Erro ao verificar sessão. Faça login novamente.",
        position: "top",
        visibilityTime: 4000,
      });
    }
  }

  async function carregarDadosIniciais() {
    try {
      setCarregandoDados(true);

      const responseCategorias = await api.get("/categorias");
      setCategorias(responseCategorias.data);

      const responseUnidades = await api.get("/unidades");
      setUnidades(responseUnidades.data);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar os dados iniciais",
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setCarregandoDados(false);
    }
  }

  async function cadastrarProduto() {
    if (!nome.trim()) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Nome do produto é obrigatório!",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (!precoCusto.trim()) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Preço de custo é obrigatório!",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (!precoVenda.trim()) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Preço de venda é obrigatório!",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (!categoriaSelecionada) {
      Toast.show({
        type: "warning",
        text1: "Atenção",
        text2: "Selecione uma categoria!",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (!unidadeSelecionada) {
      Toast.show({
        type: "warning",
        text1: "Atenção",
        text2: "Selecione uma unidade!",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (!usuarioId) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Usuário não identificado! Faça login novamente.",
        position: "top",
        visibilityTime: 4000,
      });
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        codigo_barras: codigoBarras.trim() || null,
        preco_custo: parseFloat(precoCusto),
        preco_venda: parseFloat(precoVenda),
        quantidade_estoque: parseInt(quantidadeEstoque) || 0,
        quantidade_minima: parseInt(quantidadeMinima) || 1,
        data_validade: dataValidade.trim() || null,
        lote: lote.trim() || null,
        localizacao: localizacao.trim() || null,
        imagem_url: imagemLocal || imagemUrl || null,
        categoria_id: categoriaSelecionada.id,
        unidade_id: unidadeSelecionada.id,
        usuario_id: usuarioId,
      };

      const resposta = await api.post("/produtos", dados);

      if (resposta.data) {
        Toast.show({
          type: "success",
          text1: "Sucesso!",
          text2: "Produto cadastrado com sucesso!",
          position: "top",
          visibilityTime: 3000,
        });
        limparCampos();
      }
    } catch (error: any) {
      const mensagem =
        error.response?.data?.message || error.message || "Erro desconhecido";
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: `Falha ao cadastrar produto: ${mensagem}`,
        position: "top",
        visibilityTime: 4000,
      });
    }
  }

  function limparCampos() {
    setNome("");
    setDescricao("");
    setCodigoBarras("");
    setPrecoCusto("");
    setPrecoVenda("");
    setQuantidadeEstoque("");
    setQuantidadeMinima("");
    setDataValidade("");
    setLote("");
    setLocalizacao("");
    setImagemUrl("");
    setImagemLocal(null);
    setCategoriaSelecionada(null);
    setUnidadeSelecionada(null);
  }

  const selecionarCategoria = (categoria: any) => {
    setCategoriaSelecionada(categoria);
    setModalCategoriaVisivel(false);
  };

  const selecionarUnidade = (unidade: any) => {
    setUnidadeSelecionada(unidade);
    setModalUnidadeVisivel(false);
  };

  const mostrarOpcoesFoto = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "URL da Imagem", "Galeria", "Câmera"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setModalUrlVisivel(true);
          } else if (buttonIndex === 2) {
            selecionarDaGaleria();
          } else if (buttonIndex === 3) {
            tirarFoto();
          }
        }
      );
    } else {
      setModalImagemVisivel(true);
    }
  };

  const selecionarDaGaleria = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Permissão para usar a galeria é necessária!",
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImagemLocal(result.assets[0].uri);
        setImagemUrl("");
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2:
          "Houve um erro ao selecionar imagem da galeria, tente novamente.",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const tirarFoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Permissão para usar a câmera é necessária!",
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImagemLocal(result.assets[0].uri);
        setImagemUrl("");
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2:
          "Houve um erro ao enviar a foto para o servidor, tente novamente.",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const adicionarImagemPorUrl = (url: string) => {
    if (url.trim()) {
      setImagemUrl(url.trim());
      setImagemLocal(null);
    }
    setModalUrlVisivel(false);
  };

  const removerImagem = () => {
    setImagemUrl("");
    setImagemLocal(null);
  };

  if (!fontesLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>Cadastro de Produto</Text>
          <Text style={styles.subtitulo}>Preencha os dados do produto</Text>
        </View>

        <View style={styles.form}>
          {carregandoDados ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria *</Text>
                {Platform.OS === "ios" ? (
                  <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={() => setModalCategoriaVisivel(true)}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        !categoriaSelecionada && styles.placeholderText,
                      ]}
                    >
                      {categoriaSelecionada
                        ? categoriaSelecionada.nome
                        : "Selecione uma categoria"}
                    </Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={categoriaSelecionada?.id || null}
                      onValueChange={(itemValue) => {
                        if (itemValue) {
                          const categoria = categorias.find(
                            (c) => c.id === itemValue
                          );
                          setCategoriaSelecionada(categoria);
                        }
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item
                        label="Selecione uma categoria"
                        value={null}
                      />
                      {categorias.map((categoria) => (
                        <Picker.Item
                          key={categoria.id}
                          label={categoria.nome}
                          value={categoria.id}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Unidade *</Text>
                {Platform.OS === "ios" ? (
                  <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={() => setModalUnidadeVisivel(true)}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        !unidadeSelecionada && styles.placeholderText,
                      ]}
                    >
                      {unidadeSelecionada
                        ? unidadeSelecionada.nome
                        : "Selecione uma unidade"}
                    </Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={unidadeSelecionada?.id || null}
                      onValueChange={(itemValue) => {
                        if (itemValue) {
                          const unidade = unidades.find(
                            (u) => u.id === itemValue
                          );
                          setUnidadeSelecionada(unidade);
                        }
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecione uma unidade" value={null} />
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
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <Input
              placeholder="Nome do produto"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <Input
              placeholder="Descrição do produto (opcional)"
              value={descricao}
              onChangeText={setDescricao}
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código de Barras</Text>
            <Input
              placeholder="Código de barras (opcional)"
              value={codigoBarras}
              onChangeText={setCodigoBarras}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço de Custo *</Text>
            <Input
              placeholder="Ex: 35.90"
              value={precoCusto}
              onChangeText={setPrecoCusto}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço de Venda *</Text>
            <Input
              placeholder="Ex: 49.90"
              value={precoVenda}
              onChangeText={setPrecoVenda}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantidade em Estoque</Text>
            <Input
              placeholder="Ex: 100 (padrão: 0)"
              value={quantidadeEstoque}
              onChangeText={setQuantidadeEstoque}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantidade Mínima</Text>
            <Input
              placeholder="Ex: 10 (padrão: 1)"
              value={quantidadeMinima}
              onChangeText={setQuantidadeMinima}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Validade</Text>
            <Input
              placeholder="AAAA-MM-DD (opcional)"
              value={dataValidade}
              onChangeText={setDataValidade}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lote</Text>
            <Input
              placeholder="Número do lote (opcional)"
              value={lote}
              onChangeText={setLote}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Localização</Text>
            <Input
              placeholder="Ex: A1-B2-C3 (opcional)"
              value={localizacao}
              onChangeText={setLocalizacao}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Imagem do Produto</Text>

            {imagemLocal || imagemUrl ? (
              <View style={styles.imagemContainer}>
                <Image
                  source={{ uri: imagemLocal || imagemUrl }}
                  style={styles.imagemPreview}
                  resizeMode="cover"
                />
                <View style={styles.imagemAcoes}>
                  <TouchableOpacity
                    style={styles.botaoImagemSecundario}
                    onPress={mostrarOpcoesFoto}
                  >
                    <MaterialIcons name="edit" size={16} color="#2196F3" />
                    <Text style={styles.textoBotaoSecundario}>Alterar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.botaoImagemRemover}
                    onPress={removerImagem}
                  >
                    <MaterialIcons name="delete" size={16} color="#F44336" />
                    <Text style={styles.textoBotaoRemover}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.botaoAdicionarImagem}
                onPress={mostrarOpcoesFoto}
              >
                <MaterialIcons name="add-a-photo" size={32} color="#2196F3" />
                <Text style={styles.textoBotaoImagem}>Adicionar Imagem</Text>
                <Text style={styles.subtextoBotaoImagem}>
                  URL, galeria ou câmera
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.botaoCadastrar}
            onPress={cadastrarProduto}
          >
            <Text style={styles.botaoTexto}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoLimpar} onPress={limparCampos}>
            <Text style={styles.botaoTexto}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCategoriaVisivel}
        onRequestClose={() => setModalCategoriaVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Categoria</Text>
              <TouchableOpacity onPress={() => setModalCategoriaVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categorias.map((categoria) => (
                <TouchableOpacity
                  key={categoria.id}
                  style={[
                    styles.modalOption,
                    categoria.id === categoriaSelecionada?.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => selecionarCategoria(categoria)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      categoria.id === categoriaSelecionada?.id &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {categoria.nome}
                  </Text>
                  {categoria.id === categoriaSelecionada?.id && (
                    <MaterialIcons name="check" size={20} color="#2196F3" />
                  )}
                </TouchableOpacity>
              ))}
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
              {unidades.map((unidade) => (
                <TouchableOpacity
                  key={unidade.id}
                  style={[
                    styles.modalOption,
                    unidade.id === unidadeSelecionada?.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => selecionarUnidade(unidade)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      unidade.id === unidadeSelecionada?.id &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {unidade.nome}
                  </Text>
                  {unidade.id === unidadeSelecionada?.id && (
                    <MaterialIcons name="check" size={20} color="#2196F3" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalImagemVisivel}
        onRequestClose={() => setModalImagemVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.tituloModal}>Selecionar Imagem</Text>
              <TouchableOpacity onPress={() => setModalImagemVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.opcoesImagem}>
              <TouchableOpacity
                style={styles.opcaoImagem}
                onPress={() => {
                  setModalImagemVisivel(false);
                  setModalUrlVisivel(true);
                }}
              >
                <MaterialIcons name="link" size={32} color="#2196F3" />
                <Text style={styles.textoOpcaoImagem}>URL da Imagem</Text>
                <Text style={styles.subtextoOpcaoImagem}>
                  Inserir link de uma imagem
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.opcaoImagem}
                onPress={() => {
                  setModalImagemVisivel(false);
                  selecionarDaGaleria();
                }}
              >
                <MaterialIcons name="photo-library" size={32} color="#4CAF50" />
                <Text style={styles.textoOpcaoImagem}>Galeria</Text>
                <Text style={styles.subtextoOpcaoImagem}>
                  Escolher da galeria de fotos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.opcaoImagem}
                onPress={() => {
                  setModalImagemVisivel(false);
                  tirarFoto();
                }}
              >
                <MaterialIcons name="camera-alt" size={32} color="#FF9800" />
                <Text style={styles.textoOpcaoImagem}>Câmera</Text>
                <Text style={styles.subtextoOpcaoImagem}>
                  Tirar uma nova foto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalUrlVisivel}
        onRequestClose={() => setModalUrlVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.tituloModal}>URL da Imagem</Text>
              <TouchableOpacity onPress={() => setModalUrlVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.labelModal}>Cole o link da imagem:</Text>
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={imagemUrl}
                onChangeText={setImagemUrl}
                style={styles.inputModal}
                autoCapitalize="none"
                keyboardType="url"
              />

              <View style={styles.botoesModal}>
                <TouchableOpacity
                  style={styles.botaoModalCancelar}
                  onPress={() => {
                    setModalUrlVisivel(false);
                    setImagemUrl("");
                  }}
                >
                  <Text style={styles.textoBotaoModalCancelar}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoModalConfirmar}
                  onPress={() => adicionarImagemPorUrl(imagemUrl)}
                >
                  <Text style={styles.textoBotaoModalConfirmar}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { paddingTop: 50, paddingBottom: 30, alignItems: "center" },
  titulo: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "NunitoSans_700Bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
    color: "#111827",
    justifyContent: "center",
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  optionText: {
    color: "#111827",
    fontFamily: "NunitoSans_600SemiBold",
    fontSize: 14,
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  botaoCadastrar: {
    backgroundColor: "#111827",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  botaoLimpar: {
    backgroundColor: "#6B7280",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
  },
  pickerContainer: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
  },
  picker: {
    height: 52,
    color: "#111827",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "NunitoSans_400Regular",
  },
  selectorButton: {
    height: 52,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: {
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
    color: "#111827",
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
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
    maxHeight: "50%",
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
    fontWeight: "600",
    color: "#333",
    fontFamily: "NunitoSans_600SemiBold",
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: "NunitoSans_600SemiBold",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalOptionSelected: {
    backgroundColor: "#f0f8ff",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "NunitoSans_400Regular",
  },
  modalOptionTextSelected: {
    color: "#2196F3",
    fontWeight: "500",
  },
  imagemContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  imagemPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  imagemAcoes: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  botaoImagemSecundario: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 8,
    gap: 4,
  },
  textoBotaoSecundario: {
    fontSize: 14,
    color: "#2196F3",
    fontFamily: "NunitoSans_600SemiBold",
  },
  botaoImagemRemover: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#F44336",
    borderRadius: 8,
    gap: 4,
  },
  textoBotaoRemover: {
    fontSize: 14,
    color: "#F44336",
    fontFamily: "NunitoSans_600SemiBold",
  },
  botaoAdicionarImagem: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
  },
  textoBotaoImagem: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
    marginTop: 8,
    fontFamily: "NunitoSans_600SemiBold",
  },
  subtextoBotaoImagem: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "NunitoSans_400Regular",
  },
  opcoesImagem: {
    padding: 20,
    gap: 16,
  },
  opcaoImagem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    gap: 16,
  },
  textoOpcaoImagem: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "NunitoSans_600SemiBold",
  },
  subtextoOpcaoImagem: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    fontFamily: "NunitoSans_400Regular",
  },
  modalBody: {
    padding: 20,
  },
  labelModal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    fontFamily: "NunitoSans_600SemiBold",
  },
  inputModal: {
    height: 52,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
    color: "#111827",
    marginBottom: 20,
  },
  botoesModal: {
    flexDirection: "row",
    gap: 12,
  },
  botaoModalCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    alignItems: "center",
  },
  textoBotaoModalCancelar: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "NunitoSans_600SemiBold",
  },
  botaoModalConfirmar: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#111827",
    borderRadius: 12,
    alignItems: "center",
  },
  textoBotaoModalConfirmar: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "NunitoSans_600SemiBold",
  },
});
