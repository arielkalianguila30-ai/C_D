import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getNavMode, getTabsForMode } from '../utils/navUtils';
import NavIcon from '../components/NavIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { useEffect } from 'react';

interface ExpensesScreenProps {
  navigation: any;
}

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  iconType: 'FontAwesome5' | 'Ionicons';
  subcategories: SubCategory[];
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Expenses');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const categories: Category[] = [
    {
      id: '1',
      name: 'Alimentação',
      icon: 'utensils',
      iconType: 'FontAwesome5',
      subcategories: [
        { id: '1.1', name: 'Arroz' },
        { id: '1.2', name: 'Fuba' },
        { id: '1.3', name: 'Açúcar' },
        { id: '1.4', name: 'Trigo' },
        { id: '1.5', name: 'Massa' },
        { id: '1.6', name: 'Feijão' },
        { id: '1.7', name: 'Batata' },
        { id: '1.8', name: 'Leite' },
        { id: '1.9', name: 'Ovo' },
        { id: '1.10', name: 'Margarina' },
        { id: '1.11', name: 'Óleo' },
        { id: '1.12', name: 'Sal' },
        { id: '1.13', name: 'Outros' },
      ],
    },
    {
      id: '2',
      name: 'Transporte',
      icon: 'car',
      iconType: 'FontAwesome5',
      subcategories: [
        { id: '2.1', name: 'Gasolina' },
        { id: '2.2', name: 'Diesel' },
        { id: '2.3', name: 'Táxi' },
        { id: '2.4', name: 'Óleo de motor' },
        { id: '2.5', name: 'Manutenção' },
        { id: '2.6', name: 'Viagem' },
        { id: '2.7', name: 'Seguro' },
        { id: '2.8', name: 'Gasóleo' },
      ],
    },
    {
      id: '3',
      name: 'Moradia',
      icon: 'home',
      iconType: 'Ionicons',
      subcategories: [
        { id: '3.1', name: 'Renda' },
        { id: '3.2', name: 'Água' },
        { id: '3.3', name: 'Luz / Energia' },
        { id: '3.4', name: 'Gás' },
        { id: '3.5', name: 'Internet / TV cabo' },
        { id: '3.6', name: 'Telefone' },
        { id: '3.7', name: 'Pintura' },
        { id: '3.8', name: 'Reforma' },
        { id: '3.9', name: 'Jardinagem' },
        { id: '3.10', name: 'Limpeza' },
      ],
    },
    {
      id: '4',
      name: 'Lazer',
      icon: 'gamepad',
      iconType: 'FontAwesome5',
      subcategories: [
        { id: '4.1', name: 'Cinema' },
        { id: '4.2', name: 'Festas' },
        { id: '4.3', name: 'Shows' },
        { id: '4.4', name: 'Streaming' },
        { id: '4.5', name: 'Viagem' },
        { id: '4.6', name: 'Streaming de filmes / Séries' },
        { id: '4.7', name: 'Videojogos' },
        { id: '4.8', name: 'Jogos digitais' },
        { id: '4.9', name: 'Passeios' },
        { id: '4.10', name: 'Restaurantes' },
      ],
    },
  ];

  const openCategoryModal = (category: Category) => {
    setSelectedCategory(category);
    // set dropdown items to this category's subcategories
    const mapped = category.subcategories.map((s) => ({ id: s.id, name: s.name }));
    setItems(mapped);
    setSelectedItem(null);
    setDropdownOpen(false);
    setModalVisible(true);
  };

  // Dropdown items for the floating window (populated from selected category)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [items, setItems] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string } | null>(null);
  const [itemValue, setItemValue] = useState('');
  const [expenses, setExpenses] = useState<Array<{ id: string; itemId: string; itemName: string; value: string; categoryId?: string; categoryName?: string; date: string }>>([]);

  const handleSaveSelectedItem = () => {
    if (!selectedItem) {
      Alert.alert('Atenção', 'Por favor selecione um item.');
      return;
    }
    const newExpense = {
      id: `${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      value: itemValue || '0',
      categoryId: selectedCategory?.id,
      categoryName: selectedCategory?.name,
      date: new Date().toISOString(),
    };
    const next = [newExpense, ...expenses];
    setExpenses(next);
    AsyncStorage.setItem('@expenses_v1', JSON.stringify(next)).catch(() => {});
    Alert.alert('Salvo', `${selectedItem.name} — KZ ${itemValue || '0'}`);
    setModalVisible(false);
    setSelectedItem(null);
    setItemValue('');
  };

  const handleDeleteExpense = (id: string) => {
    Alert.alert('Confirmar', 'Deseja eliminar este gasto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          const next = expenses.filter((e) => e.id !== id);
          setExpenses(next);
          AsyncStorage.setItem('@expenses_v1', JSON.stringify(next)).catch(() => {});
        },
      },
    ]);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setItemValue('');
  };

  const [tabs, setTabs] = useState<any[]>([]);

  useEffect(() => {
    const loadTabs = async () => {
      const mode = await getNavMode();
      setTabs(getTabsForMode(mode));
    };
    loadTabs();
    const unsub = navigation.addListener('focus', loadTabs);
    return unsub;
  }, [navigation]);

  // load saved expenses
  const loadExpenses = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('@expenses_v1');
      if (raw) setExpenses(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    loadExpenses();
    const unsub = navigation.addListener('focus', loadExpenses);
    return unsub;
  }, [navigation, loadExpenses]);

  // Nav icons are provided by shared component `NavIcon` for consistent size/color

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gastos</Text>
      </View>

      {/* Expenses area - only this part is scrollable/movable */}
      <View style={styles.expensesArea}>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="money-bill-wave" size={64} color={colors.lightText} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyStateTitle}>Nenhum gasto registrado</Text>
            <Text style={styles.emptyStateText}>
              Seus gastos aparecerão aqui quando você adicionar um.
            </Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
            renderItem={({ item }) => (
              <View style={styles.expenseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseTitle}>{item.itemName}</Text>
                  <Text style={styles.expenseMeta}>{item.categoryName} • {new Date(item.date).toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.expenseValue}>KZ {item.value}</Text>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteExpense(item.id)}>
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Categories (fixed) */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => openCategoryModal(category)}
            >
              {category.iconType === 'FontAwesome5' ? (
                <FontAwesome5 name={category.icon as any} size={28} color={colors.darkBlue} style={{ marginBottom: 8 }} />
              ) : (
                <Ionicons name={category.icon as any} size={28} color={colors.darkBlue} style={{ marginBottom: 8 }} />
              )}
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Subcategories Modal (floating, centered) */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedCategory && (
              <>
                {/* Modal header with close X */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedCategory.name}</Text>
                  <TouchableOpacity onPress={handleCancel}>
                    <Ionicons name="close" size={24} color={colors.darkBlue} />
                  </TouchableOpacity>
                </View>

                {/* Only keep: select item dropdown, value input and save button */}
                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    style={styles.dropdownToggle}
                    onPress={() => setDropdownOpen((v) => !v)}
                  >
                    <Text style={styles.dropdownText}>
                      {selectedItem
                        ? `${items.findIndex((it) => it.id === selectedItem.id) + 1}. ${selectedItem.name}`
                        : 'Selecionar item...'}
                    </Text>
                    <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.darkBlue} />
                  </TouchableOpacity>

                  {dropdownOpen && (
                    <View style={styles.dropdownList}>
                      <FlatList
                        data={items}
                        keyExtractor={(it) => it.id}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedItem(item);
                              setDropdownOpen(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{`${index + 1}. ${item.name}`}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  )}
                </View>

                <TextInput
                  style={styles.valorInput}
                  value={itemValue}
                  onChangeText={setItemValue}
                  placeholder="Valor do item"
                  keyboardType="numeric"
                />

                <Text style={styles.valueEcho}>Valor: {itemValue ? `KZ ${itemValue}` : '—'}</Text>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.valorButton} onPress={handleSaveSelectedItem}>
                    <Text style={styles.valorText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      

      {/* Bottom Navigation */}
      <View style={globalStyles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.screen;
          return (
            <TouchableOpacity
              key={tab.name}
              style={globalStyles.navItem}
              onPress={() => {
                setActiveTab(tab.screen);
                if (tab.screen !== 'Expenses') {
                  navigation.navigate(tab.screen);
                }
              }}
            >
              <NavIcon screen={tab.screen} active={isActive} size={22} />
              <Text style={[globalStyles.navLabel, isActive && globalStyles.navLabelActive]}>{tab.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

              
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    height: '100%',
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    marginBottom: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.lightText,
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 20,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 0.9,
    backgroundColor: colors.background,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkBlue,
    textAlign: 'center',
  },
  // navigation styles moved to globalStyles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '60%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    // floating shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  subcategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkBlue,
    flex: 1,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: colors.border,
  },
  categorySmallItem: {
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  categorySmallText: {
    color: colors.darkBlue,
    fontWeight: '700',
  },
  valorInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: colors.background,
  },
  dropdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.darkBlue,
    fontWeight: '600',
  },
  dropdownList: {
    marginTop: 8,
    maxHeight: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.darkBlue,
  },
  selectedInfo: {
    fontSize: 14,
    color: colors.darkBlue,
    fontWeight: '700',
    marginBottom: 8,
  },
  valueEcho: {
    fontSize: 14,
    color: colors.darkBlue,
    fontWeight: '600',
    marginBottom: 8,
  },
  expensesArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 140,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  expenseMeta: {
    fontSize: 12,
    color: colors.lightText,
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  deleteBtn: {
    marginTop: 8,
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 10,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  cancelText: {
    color: colors.darkBlue,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  installmentsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  installmentsText: {
    fontWeight: '700',
    color: colors.darkBlue,
  },
  valorButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  valorText: {
    color: colors.white,
    fontWeight: '700',
  },
});
