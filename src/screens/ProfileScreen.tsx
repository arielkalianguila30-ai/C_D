import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../styles/globalStyles';
import NavIcon from '../components/NavIcon';
import { Alert } from 'react-native';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [accountTypes, setAccountTypes] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>({
    name: 'Seu Nome',
    phone: '000 000 000',
    email: 'seu.email@exemplo.com',
    dob: '',
    nif: '',
    idNumber: '',
    kycStatus: 'pending',
    balance: 0,
    cardsCount: 0,
    linkedBanks: 0,
    address: { residence: '', district: '', province: '', country: '' },
    preferences: { language: 'PT', theme: 'light', notifications: true, showBalance: true },
    createdAt: '',
    accountLevel: 'Básico',
    trustScore: 0,
  });
  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('@account_types');
      const arr = stored ? JSON.parse(stored) : [];
      setAccountTypes(arr);
    };
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const raw = await AsyncStorage.getItem('@user_profile');
        if (raw) setProfile(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
    };
    loadProfile();
    const unsub = navigation.addListener('focus', loadProfile);
    return unsub;
  }, [navigation]);

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

  // Nav icons handled by NavIcon component

  const handleUpdateDocuments = () => {
    Alert.alert('Atualizar documentos', 'Funcionalidade de upload de documentos ainda não implementada.');
  };

  const handleFacialVerification = () => {
    Alert.alert('Verificação facial', 'Funcionalidade de verificação facial ainda não implementada.');
  };

  const handleManageCards = () => {
    navigation.navigate('CardRegistration');
  };

  const handleChangePin = () => {
    Alert.alert('Alterar PIN/Senha', 'Funcionalidade de alteração de senha/PIN ainda não implementada.');
  };

  const handleLogout = () => {
    navigation.replace('Splash');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <FontAwesome5 name="user-circle" size={48} color="#fff" />
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
          <Text style={styles.userMeta}>{profile.phone} {profile.dob ? `· ${profile.dob}` : ''}</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="settings-outline" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="lock-closed" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Segurança</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="information-circle-outline" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Sobre</Text>
          </TouchableOpacity>

          {/* create other account */}
          {accountTypes.includes('personal') && !accountTypes.includes('family') && (
            <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Signup', { preselectType: 'family' })}>
              <FontAwesome5 name="users" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>Criar Conta Familiar</Text>
            </TouchableOpacity>
          )}

          {accountTypes.includes('family') && !accountTypes.includes('personal') && (
            <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('Signup', { preselectType: 'personal' })}>
              <FontAwesome5 name="user" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
              <Text style={styles.optionText}>Criar Conta Pessoal</Text>
            </TouchableOpacity>
          )}

          {/* Documents / Verification */}
          <View style={styles.sectionHeaderBlock}>
            <Text style={styles.sectionTitle}>Documentos / Verificação</Text>
          </View>

          <View style={styles.optionItemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTextBold}>Número de BI / Documento</Text>
              <Text style={styles.optionTextSmall}>{profile.idNumber || '—'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.kycStatus}>{profile.kycStatus === 'verified' ? '✔️ Verificado' : profile.kycStatus === 'pending' ? '⏳ Pendente' : '❌ Não verificado'}</Text>
              <TouchableOpacity style={styles.smallButton} onPress={handleUpdateDocuments}><Text style={styles.smallButtonText}>Atualizar documentos</Text></TouchableOpacity>
              <TouchableOpacity style={styles.smallButton} onPress={handleFacialVerification}><Text style={styles.smallButtonText}>Verificação facial</Text></TouchableOpacity>
            </View>
          </View>

          {/* Security */}
          <View style={styles.sectionHeaderBlock}>
            <Text style={styles.sectionTitle}>Segurança da Conta</Text>
          </View>
          <TouchableOpacity style={styles.optionItem} onPress={handleChangePin}>
            <Ionicons name="lock-closed" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Alterar senha / PIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => Alert.alert('Configurar PIN de transações')}>
            <Ionicons name="key" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Configurar PIN de transações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => Alert.alert('2FA')}>
            <Ionicons name="shield-checkmark" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Autenticação 2FA</Text>
          </TouchableOpacity>

          {/* Financial Info */}
          <View style={styles.sectionHeaderBlock}>
            <Text style={styles.sectionTitle}>Informações Financeiras</Text>
          </View>
          <View style={styles.optionItemRow}>
            <View>
              <Text style={styles.optionTextBold}>Saldo</Text>
              <Text style={styles.optionTextSmall}>KZ {profile.balance}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.optionTextBold}>Cartões</Text>
              <Text style={styles.optionTextSmall}>{profile.cardsCount} conectados</Text>
              <TouchableOpacity style={styles.smallButton} onPress={handleManageCards}><Text style={styles.smallButtonText}>Gerir cartões</Text></TouchableOpacity>
            </View>
          </View>

          {/* Address */}
          <View style={styles.sectionHeaderBlock}>
            <Text style={styles.sectionTitle}>Endereço</Text>
          </View>
          <View style={styles.optionItemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTextSmall}>{profile.address.residence || '—'}</Text>
              <Text style={styles.optionTextSmall}>{profile.address.district || ''} · {profile.address.province || ''} · {profile.address.country || ''}</Text>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.sectionHeaderBlock}>
            <Text style={styles.sectionTitle}>Preferências</Text>
          </View>
          <View style={styles.optionItemRow}>
            <Text style={styles.optionTextSmall}>Idioma: {profile.preferences.language}</Text>
            <Text style={styles.optionTextSmall}>Tema: {profile.preferences.theme}</Text>
          </View>

          {/* History */}
          <View style={styles.sectionHeaderBlock}>
            <Text style={styles.sectionTitle}>Histórico</Text>
          </View>
          <View style={styles.optionItemRow}>
            <Text style={styles.optionTextSmall}>Conta criada: {profile.createdAt || '—'}</Text>
            <Text style={styles.optionTextSmall}>Nível: {profile.accountLevel}</Text>
          </View>

          {/* Support */}
          <View style={styles.sectionHeaderBlock}>
            <Text style={styles.sectionTitle}>Suporte e Ajuda</Text>
          </View>
          <TouchableOpacity style={styles.optionItem} onPress={() => Alert.alert('Centro de ajuda')}>
            <Ionicons name="help-circle" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Centro de ajuda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => Alert.alert('Chat com suporte')}>
            <Ionicons name="chatbubbles" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Chat com suporte</Text>
          </TouchableOpacity>

          {/* Final logout button */}
          <TouchableOpacity
            style={[styles.optionItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.darkBlue} style={{ marginRight: 12 }} />
            <Text style={styles.optionText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={globalStyles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.screen;
          return (
            <TouchableOpacity
              key={tab.name}
              style={globalStyles.navItem}
              onPress={() => {
                setActiveTab(tab.screen);
                if (tab.screen !== 'Profile') navigation.navigate(tab.screen);
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
  profileCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.lightText,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkBlue,
  },
  logoutItem: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
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
  userMeta: {
    fontSize: 13,
    color: colors.lightText,
    marginTop: 6,
  },
  sectionHeaderBlock: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 6,
  },
  optionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  optionTextBold: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  optionTextSmall: {
    fontSize: 13,
    color: colors.lightText,
  },
  kycStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 6,
  },
  smallButton: {
    marginTop: 6,
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  smallButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
