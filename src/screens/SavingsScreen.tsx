import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../styles/colors';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getNavMode, getTabsForMode } from '../utils/navUtils';
import { useEffect } from 'react';

interface SavingsScreenProps {
  navigation: any;
}

export const SavingsScreen: React.FC<SavingsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Savings');

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Poupança</Text>
        </View>

        <View style={styles.emptyState}>
          <FontAwesome5 name="piggy-bank" size={64} color={colors.lightText} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyStateTitle}>Nenhuma poupança</Text>

          <TouchableOpacity style={styles.createGoalButton} onPress={() => navigation.navigate('SavingsGoal')}>
            <Text style={styles.createGoalButtonText}>Começar Poupança</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => {
              setActiveTab(tab.screen);
              if (tab.screen !== 'Savings') {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  createGoalButton: {
    marginTop: 20,
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createGoalButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
