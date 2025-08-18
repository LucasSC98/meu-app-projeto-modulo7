import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { PieChart } from "react-native-chart-kit";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Dashboard() {
  const [unidadeSelecionada, setUnidadeSelecionada] = useState("Unidade 1");
  const [modalVisible, setModalVisible] = useState(false);

  const unidades = Array.from({ length: 7 }).map((_, i) => `Unidade ${i + 1}`);

  const selecionarUnidade = (unidade: string) => {
    setUnidadeSelecionada(unidade);
    setModalVisible(false);
  };

  const abcData = [
    {
      name: "Classe A",
      population: 40,
      color: "#0400f9ff",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Classe B",
      population: 30,
      color: "#22D3EE",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Classe C",
      population: 30,
      color: "#FBBF24",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sistema WMS</Text>
        <Text style={styles.headerSubtitle}>
          Controle de Estoque • ERP AGROTITAN
        </Text>
      </View>

      {/* Seleção de Unidade */}
      <View style={{ marginHorizontal: 20, marginTop: 16 }}>
        <Text style={styles.sectionTitle}>Unidade</Text>
        {Platform.OS === "ios" ? (
          <>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.pickerText}>{unidadeSelecionada}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Selecionar Unidade</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {unidades.map((unidade) => (
                      <TouchableOpacity
                        key={unidade}
                        style={[
                          styles.modalOption,
                          unidade === unidadeSelecionada &&
                            styles.modalOptionSelected,
                        ]}
                        onPress={() => selecionarUnidade(unidade)}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            unidade === unidadeSelecionada &&
                              styles.modalOptionTextSelected,
                          ]}
                        >
                          {unidade}
                        </Text>
                        {unidade === unidadeSelecionada && (
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
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={unidadeSelecionada}
              onValueChange={(val) => setUnidadeSelecionada(val)}
              style={styles.picker}
              mode="dropdown"
            >
              {unidades.map((unidade) => (
                <Picker.Item key={unidade} label={unidade} value={unidade} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Cards de Resumo */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: "#E3F2FD" }]}>
          <MaterialIcons name="inventory" size={24} color="#2196F3" />
          <Text style={styles.cardValue}>120</Text>
          <Text style={styles.cardTitle}>Total de Produtos</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#FFEBEE" }]}>
          <MaterialIcons name="warning" size={24} color="#F44336" />
          <Text style={styles.cardValue}>2</Text>
          <Text style={styles.cardTitle}>Produtos Vencendo</Text>
        </View>
      </View>

      {/* Curva ABC */}
      <View style={styles.abcCard}>
        <Text style={styles.sectionTitle}>Curva ABC</Text>
        <PieChart
          data={abcData}
          width={SCREEN_WIDTH - 40}
          height={180}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(51,51,51,${opacity})`,
            labelColor: (opacity = 1) => `rgba(51,51,51,${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
          hasLegend
          absolute
        />
      </View>

      {/* Produtos Vencendo */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="warning" size={20} color="#F44336" />
          <Text style={styles.sectionTitle}>
            Produtos Próximos ao Vencimento
          </Text>
        </View>
        <View style={styles.productCard}>
          <Text style={styles.productName}>Fertilizante NPK</Text>
          <Text style={styles.productDetails}>Lote: L001234 • Qtd: 50</Text>
        </View>
        <View style={styles.productCard}>
          <Text style={styles.productName}>Sementes Milho</Text>
          <Text style={styles.productDetails}>Lote: L005678 • Qtd: 20</Text>
        </View>
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.buttonText}>Nova Movimentação</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <MaterialIcons name="file-download" size={20} color="#2196F3" />
          <Text style={[styles.buttonText, { color: "#2196F3" }]}>
            Exportar Dados
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.quickNavigation}>
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.quickNavGrid}>
          <TouchableOpacity style={styles.quickNavItem}>
            <MaterialIcons name="inventory" size={32} color="#2196F3" />
            <Text style={styles.quickNavText}>Lista de Produtos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickNavItem}>
            <MaterialIcons name="add-box" size={32} color="#4CAF50" />
            <Text style={styles.quickNavText}>Novo Produto</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
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
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#333" },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 2 },

  pickerContainer: {
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
  picker: {
    backgroundColor: "#fff",
    color: "#333",
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
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
  },
  modalOptionTextSelected: {
    color: "#2196F3",
    fontWeight: "500",
  },
  // --- FIM DOS ESTILOS CORRIGIDOS ---

  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  cardValue: { fontSize: 24, fontWeight: "bold", color: "#333" },
  cardTitle: { fontSize: 12, color: "#666", fontWeight: "500" },
  abcCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    alignItems: "center",
  },
  section: {
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  productCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productName: { fontSize: 14, fontWeight: "500", color: "#333" },
  productDetails: { fontSize: 12, color: "#666", marginBottom: 2 },
  actionButtons: { paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  primaryButton: { backgroundColor: "#2196F3" },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  buttonText: { fontSize: 14, fontWeight: "500", color: "#fff" },
  quickNavigation: { paddingHorizontal: 20, paddingBottom: 30 },
  quickNavGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  quickNavItem: {
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
  quickNavText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
});
