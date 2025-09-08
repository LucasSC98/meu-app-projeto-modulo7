import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface SelectOption {
  id: number | string;
  nome: string;
  [key: string]: any;
}

interface SelectProps {
  label: string;
  placeholder: string;
  value: SelectOption | null;
  options: SelectOption[];
  onValueChange: (value: SelectOption | null) => void;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  accessibilityLabel?: string;
  renderOption?: (item: SelectOption) => React.ReactNode;
}

export function Select({
  label,
  placeholder,
  value,
  options,
  onValueChange,
  required = false,
  disabled = false,
  searchable = false,
  accessibilityLabel,
  renderOption,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  const handleOpenModal = () => {
    if (disabled) return;
    setModalVisible(true);
    setSearchText("");
    setFilteredOptions(options);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchText("");
  };

  const handleSelectOption = (option: SelectOption) => {
    onValueChange(option);
    handleCloseModal();
  };

  const handleClearSelection = () => {
    onValueChange(null);
    handleCloseModal();
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  };

  const renderDefaultOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => handleSelectOption(item)}
      accessibilityLabel={`Selecionar ${item.nome}`}
      accessibilityRole="button"
    >
      <Text style={styles.optionText}>{item.nome}</Text>
      {value?.id === item.id && (
        <MaterialIcons name="check" size={20} color="#2196F3" />
      )}
    </TouchableOpacity>
  );

  const renderOptionItem = ({ item }: { item: SelectOption }) => {
    if (renderOption) {
      return (
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => handleSelectOption(item)}
          accessibilityLabel={`Selecionar ${item.nome}`}
          accessibilityRole="button"
        >
          {renderOption(item)}
          {value?.id === item.id && (
            <MaterialIcons name="check" size={20} color="#2196F3" />
          )}
        </TouchableOpacity>
      );
    }
    return renderDefaultOption({ item });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
          value && styles.selectorSelected,
        ]}
        onPress={handleOpenModal}
        disabled={disabled}
        accessibilityLabel={
          accessibilityLabel || `Selecionar ${label.toLowerCase()}`
        }
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Text
          style={[
            styles.selectorText,
            !value && styles.selectorPlaceholder,
            disabled && styles.selectorTextDisabled,
          ]}
        >
          {value ? value.nome : placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={disabled ? "#ccc" : "#666"}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                accessibilityLabel="Fechar modal"
                accessibilityRole="button"
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar..."
                  value={searchText}
                  onChangeText={handleSearch}
                  accessibilityLabel="Campo de busca"
                />
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderOptionItem}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="search-off" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {searchText
                      ? "Nenhum resultado encontrado"
                      : "Nenhuma opção disponível"}
                  </Text>
                </View>
              }
            />

            {value && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSelection}
                  accessibilityLabel="Limpar seleção"
                  accessibilityRole="button"
                >
                  <Text style={styles.clearButtonText}>Limpar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    fontFamily: "NunitoSans_600SemiBold",
  },
  required: {
    color: "#F44336",
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
  selectorDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  selectorSelected: {
    borderColor: "#2196F3",
    backgroundColor: "#f8fbff",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    fontFamily: "NunitoSans_400Regular",
  },
  selectorPlaceholder: {
    color: "#999",
  },
  selectorTextDisabled: {
    color: "#ccc",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Platform.OS === "ios" ? "85%" : "90%",
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "NunitoSans_700Bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "NunitoSans_400Regular",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    fontFamily: "NunitoSans_400Regular",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  clearButton: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#666",
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
  },
});
