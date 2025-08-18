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
import { MaskedTextInput } from "react-native-mask-text";
import { Input } from "../components/Input";
import { RootStackParamList } from "../types/navigation";

export default function CadastroUnidade() {
  type CadastroScreenProp = NativeStackNavigationProp<
    RootStackParamList,
    "CadastroUnidade"
  >;
  const navigation = useNavigation<CadastroScreenProp>();

  const [fontesLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  const [nome, setNome] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [estado, setEstado] = useState("");

  async function cadastrarUnidade() {
    if (!nome || !cep || !rua || !bairro || !numero || !estado) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const resposta = await fetch("http://10.10.21.229:3000/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cep, rua, bairro, numero, estado }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao cadastrar a unidade.");
      }

      Alert.alert("Sucesso", "Unidade cadastrada com sucesso!");
      limparCampos();
    } catch (error) {
      Alert.alert("Erro", String(error));
    }
  }

  function limparCampos() {
    setNome("");
    setCep("");
    setRua("");
    setBairro("");
    setNumero("");
    setEstado("");
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
          <Text style={styles.titulo}>Cadastro de Unidade</Text>
          <Text style={styles.subtitulo}>Preencha os dados da filial</Text>
        </View>

        <View style={styles.form}>
          {/* Nome da Unidade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Unidade</Text>
            <Input
              placeholder="Nome da unidade"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
          </View>

          {/* CEP */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CEP</Text>
            <MaskedTextInput
              mask="99999-999"
              keyboardType="numeric"
              value={cep}
              onChangeText={setCep}
              style={styles.input}
              placeholder="00000-000"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Rua */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rua</Text>
            <Input
              placeholder="Nome da rua"
              value={rua}
              onChangeText={setRua}
              style={styles.input}
            />
          </View>

          {/* Bairro */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bairro</Text>
            <Input
              placeholder="Nome do bairro"
              value={bairro}
              onChangeText={setBairro}
              style={styles.input}
            />
          </View>

          {/* Número */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número</Text>
            <Input
              placeholder="Número"
              keyboardType="numeric"
              value={numero}
              onChangeText={setNumero}
              style={styles.input}
            />
          </View>

          {/* Estado */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado</Text>
            <Input
              placeholder="Ex: PR"
              maxLength={2}
              autoCapitalize="characters"
              value={estado}
              onChangeText={setEstado}
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={styles.botaoCadastrar}
            onPress={cadastrarUnidade}
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
