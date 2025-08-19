import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito-sans";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
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
import api from "../services/api";
import Toast from "react-native-toast-message";

export default function CadastroUnidade() {
  // type CadastroScreenProp = NativeStackNavigationProp<
  //   RootStackParamList,
  //   "CadastroUnidade"
  // >;
  // const navigation = useNavigation<CadastroScreenProp>();

  const [fontesLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);

  async function buscarEnderecoPorCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCep(true);

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const dados = await resposta.json();

      if (dados.erro) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "CEP não encontrado!",
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }

      setRua(dados.logradouro || "");
      setBairro(dados.bairro || "");
      setCidade(dados.localidade || "");
      setEstado(dados.uf || "");
    } catch {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível buscar o CEP. Verifique sua conexão.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setBuscandoCep(false);
    }
  }

  async function cadastrarUnidade() {
    if (!nome || !cep || !rua || !bairro || !numero || !cidade || !estado) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Preencha todos os campos obrigatórios!",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const resposta = await api.post("/unidades", {
        nome,
        descricao: descricao || null,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep,
      });

      if (!resposta.data) {
        throw new Error("Erro ao cadastrar a unidade.");
      }

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Unidade cadastrada com sucesso!",
        position: "top",
        visibilityTime: 3000,
      });
      limparCampos();
    } catch (error: any) {
      const mensagem =
        error.response?.data?.message || error.message || "Erro desconhecido";
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: `Falha ao cadastrar unidade: ${mensagem}`,
        position: "top",
        visibilityTime: 3000,
      });
    }
  }

  function limparCampos() {
    setNome("");
    setDescricao("");
    setCep("");
    setRua("");
    setBairro("");
    setNumero("");
    setCidade("");
    setEstado("");
    setBuscandoCep(false);
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Unidade *</Text>
            <Input
              placeholder="Nome da unidade"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <Input
              placeholder="Descrição da unidade (opcional)"
              value={descricao}
              onChangeText={setDescricao}
              style={styles.input}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              CEP * {buscandoCep && "(Buscando...)"}
            </Text>
            <MaskedTextInput
              mask="99999-999"
              keyboardType="numeric"
              value={cep}
              onChangeText={(texto) => {
                setCep(texto);
                buscarEnderecoPorCep(texto);
              }}
              style={[styles.input, buscandoCep && styles.inputCarregando]}
              placeholder="00000-000"
              placeholderTextColor="#9CA3AF"
              editable={!buscandoCep}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Rua * {rua && "(Preenchido automaticamente)"}
            </Text>
            <Input
              placeholder="Nome da rua"
              value={rua}
              onChangeText={setRua}
              style={[styles.input, rua && styles.inputPreenchido]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número *</Text>
            <Input
              placeholder="Número"
              keyboardType="numeric"
              value={numero}
              onChangeText={setNumero}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Bairro * {bairro && "(Preenchido automaticamente)"}
            </Text>
            <Input
              placeholder="Nome do bairro"
              value={bairro}
              onChangeText={setBairro}
              style={[styles.input, bairro && styles.inputPreenchido]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Cidade * {cidade && "(Preenchido automaticamente)"}
            </Text>
            <Input
              placeholder="Nome da cidade"
              value={cidade}
              onChangeText={setCidade}
              style={[styles.input, cidade && styles.inputPreenchido]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Estado * {estado && "(Preenchido automaticamente)"}
            </Text>
            <Input
              placeholder="Ex: PR"
              maxLength={2}
              autoCapitalize="characters"
              value={estado}
              onChangeText={setEstado}
              style={[styles.input, estado && styles.inputPreenchido]}
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
  inputCarregando: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  inputPreenchido: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
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
