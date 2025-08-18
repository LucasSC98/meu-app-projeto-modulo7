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

export default function CadastroCategoria() {
  type CadastroScreenProp = NativeStackNavigationProp<
    RootStackParamList,
    "CadastroCategoria"
  >;
  const navigation = useNavigation<CadastroScreenProp>();

  const [fontesLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  async function cadastrarCategoria() {
    if (!nome || !descricao) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const resposta = await fetch("http://10.10.21.229:3000/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, descricao }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao cadastrar a categoria.");
      }

      Alert.alert("Sucesso", "Categoria cadastrada com sucesso!");
      limparCampos();
    } catch (error) {
      Alert.alert("Erro", String(error));
    }
  }

  function limparCampos() {
    setNome("");
    setDescricao("");
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
          <Text style={styles.titulo}>Cadastro de Categoria</Text>
          <Text style={styles.subtitulo}>Preencha os dados da categoria</Text>
        </View>

        <View style={styles.form}>
          {/* Nome da Categoria */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <Input
              placeholder="Nome da categoria"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <Input
              placeholder="Descrição da categoria"
              value={descricao}
              onChangeText={setDescricao}
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.botaoCadastrar}
            onPress={cadastrarCategoria}
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
