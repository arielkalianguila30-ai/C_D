import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { colors } from '../styles/colors';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNavMode, getTabsForMode } from '../utils/navUtils';
import { CardDisplay } from '../components/CardDisplay';

interface WalletScreenProps {
  navigation: any;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ navigation, route }: any) => {
  const [activeTab, setActiveTab] = useState('Wallet');
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    // load cards and previously selected card; if navigated with selectedCard param, prefer it
    const loadAll = async () => {
      try {
        const stored = await AsyncStorage.getItem('@cards_v1');
        const arr = stored ? JSON.parse(stored) : [];
        setCards(arr);

        // if route param provided, use it and persist
        if (route && route.params && route.params.selectedCard) {
          const c = route.params.selectedCard;
          setSelectedCard(c);
          await AsyncStorage.setItem('@cards_selected', JSON.stringify(c));
          return;
        }

        const sel = await AsyncStorage.getItem('@cards_selected');
        if (sel) {
          setSelectedCard(JSON.parse(sel));
        } else if (arr && arr.length > 0) {
          setSelectedCard(arr[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar cartões/seleção', err);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadAll);
    loadAll();
    return unsubscribe;
  }, [navigation, route]);

  const [tabs, setTabs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const mode = await getNavMode();
      setTabs(getTabsForMode(mode));
    };
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const renderIcon = (screen: string, color: string) => {
    switch (screen) {
      case 'Wallet':
        return <FontAwesome5 name="wallet" size={22} color={color} />;
      case 'Expenses':
        return <Ionicons name="stats-chart" size={22} color={color} />;
      case 'Savings':
        return <FontAwesome5 name="piggy-bank" size={22} color={color} />;
      case 'Kixikila':
        return <FontAwesome5 name="users" size={22} color={color} />;
      case 'Profile':
        return <Ionicons name="person" size={22} color={color} />;
      default:
        return <Ionicons name="ellipse" size={22} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carteira</Text>
        </View>

        {/* Featured / Selected Card */}
        {selectedCard ? (
          <View style={styles.featuredCardContainer}>
            <CardDisplay
              number={selectedCard.number}
              holder={selectedCard.holder}
              expiry={selectedCard.expiry}
              brand={selectedCard.brand}
              bank={selectedCard.bank}
            />
            <TouchableOpacity style={styles.changeButton} onPress={() => setPickerVisible(true)}>
              <Text style={styles.changeButtonText}>Mudar cartão</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardSection}>
            <View style={styles.card}>
              <Text style={styles.cardText}>Sem cartão selecionado</Text>
            </View>
          </View>
        )}

        {/* Card picker modal */}
        <Modal visible={pickerVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecionar Cartão</Text>
              <FlatList
                data={cards}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCard(item);
                      AsyncStorage.setItem('@cards_selected', JSON.stringify(item)).catch((e) =>
                        console.error('Erro ao salvar seleção', e),
                      );
                      setPickerVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{`${item.holder} •••• ${item.number.slice(-4)}`}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              />

              <TouchableOpacity style={styles.modalClose} onPress={() => setPickerVisible(false)}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Balance Info Section */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Saldo actual</Text>
            <Text style={styles.balanceValue}>Kz 2000,00</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Poupança actual</Text>
            <Text style={styles.balanceValue}>Kz 100,00</Text>
          </View>
        </View>

        {/* Expenses Section */}
        <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>Gastos Geral</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Alimentação  200.000</Text>
            <Text style={styles.emptyStateText}>Saúde</Text>
          </View>
        </View>

         {/* Expenses Section gasto do mes corrente */}
        <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>Gastos Mes actual</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Alimentação- 100</Text>
            <Text style={styles.emptyStateText}>Saúde - 100</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => {
              setActiveTab(tab.screen);
              if (tab.screen !== 'Wallet') {
                navigation.navigate(tab.screen);
              }
            }}
          >
            {renderIcon(tab.screen, activeTab === tab.screen ? colors.secondary : colors.lightText)}
            <Text
              style={[
                styles.navLabel,
                activeTab === tab.screen && styles.navLabelActive,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  cardSection: {
    marginBottom: 32,
  },
  featuredCardContainer: {
    marginBottom: 16,
  },
  changeButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  changeButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  modalItemText: {
    color: colors.darkBlue,
    fontWeight: '600',
  },
  modalClose: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    height: 180,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  cardText: {
    fontSize: 16,
    color: colors.lightText,
    fontWeight: '500',
  },
  balanceSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceItem: {
    paddingVertical: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.lightText,
    marginBottom: 4,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  expensesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.lightText,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: colors.lightText,
    fontWeight: '500',
  },
  navLabelActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
});
