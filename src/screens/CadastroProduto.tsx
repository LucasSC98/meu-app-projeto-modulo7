import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito-sans";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Input } from "../components/Input";
import { RootStackParamList } from "../types/navigation";

export default function CadastroProduto() {
  type CadastroScreenProp = NativeStackNavigationProp<
    RootStackParamList,
    "CadastroProduto"
  >;
  const navigation = useNavigation<CadastroScreenProp>();

  const [fontesLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  const [categoria, setCategoria] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [disponibilidade, setDisponibilidade] = useState<
    "disponível" | "esgotado"
  >("disponível");

  async function cadastrarProduto() {
    if (!categoria || !nome || !descricao || !preco || !imagemUrl) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const resposta = await fetch("http://10.10.21.229:3000/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria,
          nome,
          descricao,
          preco: parseFloat(preco),
          imagemUrl,
          disponibilidade,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao cadastrar o produto.");
      }

      Alert.alert("Sucesso", "Produto cadastrado com sucesso!");
      limparCampos();
    } catch (error) {
      Alert.alert("Erro", String(error));
    }
  }

  function limparCampos() {
    setCategoria("");
    setNome("");
    setDescricao("");
    setPreco("");
    setImagemUrl("");
    setDisponibilidade("disponível");
  }

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
          {/* Categoria */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() =>
                Alert.alert("Ação", "Aqui vai abrir a lista de categorias")
              }
            >
              <Text style={{ color: categoria ? "#111827" : "#9CA3AF" }}>
                {categoria || "Selecionar categoria"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <Input
              placeholder="Nome do produto"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <Input
              placeholder="Descrição do produto"
              value={descricao}
              onChangeText={setDescricao}
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
            />
          </View>

          {/* Preço */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preço</Text>
            <Input
              placeholder="Ex: 49.90"
              value={preco}
              onChangeText={setPreco}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          {/* Imagem URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Imagem (URL)</Text>
            <Input
              placeholder="https://exemplo.com/imagem.jpg"
              value={imagemUrl}
              onChangeText={setImagemUrl}
              style={styles.input}
            />
          </View>

          {/* Disponibilidade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Disponibilidade</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  disponibilidade === "disponível" && styles.optionSelected,
                ]}
                onPress={() => setDisponibilidade("disponível")}
              >
                <Text
                  style={[
                    styles.optionText,
                    disponibilidade === "disponível" &&
                      styles.optionTextSelected,
                  ]}
                >
                  Disponível
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  disponibilidade === "esgotado" && styles.optionSelected,
                ]}
                onPress={() => setDisponibilidade("esgotado")}
              >
                <Text
                  style={[
                    styles.optionText,
                    disponibilidade === "esgotado" && styles.optionTextSelected,
                  ]}
                >
                  Esgotado
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botões */}
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
});
