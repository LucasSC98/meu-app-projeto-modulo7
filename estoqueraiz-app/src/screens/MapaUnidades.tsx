import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import api from "../services/api";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

interface Unidade {
  id: number;
  nome: string;
  descricao?: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number;
  longitude?: number;
}

export default function MapaUnidades() {
  const navigation = useNavigation();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const carregarUnidades = React.useCallback(async () => {
    try {
      setCarregando(true);
      const response = await api.get("/unidades");
      const unidadesData = response.data;
      const unidadesComCoordenadas = await Promise.all(
        unidadesData.map(async (unidade: Unidade) => {
          try {
            const endereco = `${unidade.rua}, ${unidade.numero}, ${unidade.bairro}, ${unidade.cidade}, ${unidade.estado}, ${unidade.cep}`;
            const coordenadas = await obterCoordenadas(endereco);
            return {
              ...unidade,
              latitude: coordenadas?.latitude,
              longitude: coordenadas?.longitude,
            };
          } catch (error) {
            console.error("Erro ao geocodificar unidade:", unidade.nome, error);
            return unidade;
          }
        })
      );

      setUnidades(unidadesComCoordenadas);
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar as unidades",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarUnidades();
    obterLocalizacaoUsuario();
  }, [carregarUnidades]);

  async function obterLocalizacaoUsuario() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permissão de localização foi negada");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocalizacaoUsuario({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Houve um erro ao obter a localização do usuário:", error);
    }
  }

  async function obterCoordenadas(endereco: string) {
    try {
      try {
        const coordenadas = await Location.geocodeAsync(endereco);
        if (coordenadas.length > 0) {
          return {
            latitude: coordenadas[0].latitude,
            longitude: coordenadas[0].longitude,
          };
        }
      } catch {
        console.error("Não foi possível obter coordenadas com Expo Location");
        const enderecoFormatado = encodeURIComponent(endereco);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${enderecoFormatado}&limit=1&countrycodes=BR`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            return {
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon),
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Erro na geocodificação:", error);
      return null;
    }
  }

  const unidadesComCoordenadas = unidades.filter(
    (unidade) => unidade.latitude && unidade.longitude
  );

  const regiaoInicial = localizacaoUsuario || {
    latitude: -25.4284, // cwb
    longitude: -49.2733,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextos}>
          <Text style={styles.titulo}>Mapa das Unidades</Text>
          <View style={styles.subtituloContainer}>
            {carregando && <ActivityIndicator size="small" color="#059669" />}
            <Text style={styles.subtitulo}>
              {carregando
                ? "Carregando unidades..."
                : `${unidadesComCoordenadas.length} unidades localizadas`}
            </Text>
          </View>
        </View>
      </View>
      <MapView
        style={styles.mapa}
        initialRegion={{
          ...regiaoInicial,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {unidadesComCoordenadas.map((unidade) => (
          <Marker
            key={unidade.id}
            coordinate={{
              latitude: unidade.latitude!,
              longitude: unidade.longitude!,
            }}
            title={unidade.nome}
            description={`${unidade.rua}, ${unidade.numero} - ${unidade.bairro}`}
          >
            <View style={styles.marcadorCustom}>
              <MaterialIcons name="location-on" size={30} color="#059669" />
            </View>
            <Callout style={styles.callout}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitulo}>{unidade.nome}</Text>
                <Text style={styles.calloutEndereco}>
                  {unidade.rua}, {unidade.numero}
                </Text>
                <Text style={styles.calloutEndereco}>
                  {unidade.bairro}, {unidade.cidade} - {unidade.estado}
                </Text>
                <Text style={styles.calloutCep}>CEP: {unidade.cep}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {unidades.length > unidadesComCoordenadas.length && (
        <View style={styles.unidadesSemLocalizacao}>
          <Text style={styles.tituloSemLocalizacao}>
            Unidades sem localização:
          </Text>
          <ScrollView style={styles.listaSemLocalizacao}>
            {unidades
              .filter((unidade) => !unidade.latitude || !unidade.longitude)
              .map((unidade) => (
                <View key={unidade.id} style={styles.itemSemLocalizacao}>
                  <Text style={styles.nomeUnidadeSemLocalizacao}>
                    {unidade.nome}
                  </Text>
                  <Text style={styles.enderecoSemLocalizacao}>
                    {unidade.rua}, {unidade.numero} - {unidade.bairro}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botaoVoltar: {
    marginRight: 16,
  },
  headerTextos: {
    flex: 1,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subtituloContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  subtitulo: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  mapa: {
    flex: 1,
  },
  marcadorCustom: {
    alignItems: "center",
    justifyContent: "center",
  },
  callout: {
    width: 250,
  },
  calloutContainer: {
    padding: 10,
  },
  calloutTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  calloutEndereco: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  calloutCep: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  unidadesSemLocalizacao: {
    backgroundColor: "#f8f9fa",
    maxHeight: 150,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  tituloSemLocalizacao: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    padding: 12,
    paddingBottom: 8,
  },
  listaSemLocalizacao: {
    maxHeight: 100,
  },
  itemSemLocalizacao: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  nomeUnidadeSemLocalizacao: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  enderecoSemLocalizacao: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
