import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import NavIcon from '../components/NavIcon';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  order: number;
  status: 'paid' | 'pending' | 'late';
  paidAmount: number;
}

const sampleParticipants: Participant[] = [
  { id: '1', name: 'Maria Manuel', order: 1, status: 'paid', paidAmount: 5000 },
  { id: '2', name: 'João Pedro', order: 2, status: 'pending', paidAmount: 0 },
  { id: '3', name: 'Célia Jorge', order: 3, status: 'late', paidAmount: 0 },
  { id: '4', name: 'Ana Paulo', order: 4, status: 'paid', paidAmount: 5000 },
];

export const KixikilaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [participants, setParticipants] = useState<Participant[]>(sampleParticipants);
  const [showCycleDetails, setShowCycleDetails] = useState(false);
  const STORAGE_KEY = '@kixikila_participants_v1';

  useEffect(() => {
    // load participants from storage on mount
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Participant[];
          setParticipants(parsed);
        }
      } catch (e) {
        console.warn('Failed loading kixikila data', e);
      }
    })();
  }, []);

  useEffect(() => {
    // save whenever participants change
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
      } catch (e) {
        console.warn('Failed saving kixikila data', e);
      }
    })();
  }, [participants]);

  // Example group data
  const groupName = 'Kixikila Bairro Central';
  const contribution = 5000; // Kz per cycle
  const cycles = 12;
  const totalExpected = contribution * participants.length * 1; // single-round distribuition example
  const nextReceiver = 'Ana Paulo';
  const status = 'Ativa';

  // Example user position
  const myPosition = {
    contributionToday: contribution,
    turnsLeft: 3,
    expectedDate: '20 Fev 2025',
    totalContributed: 15000,
  };

  const onContributeNow = () => {
    // Try to open card registration if no card, otherwise show quick confirm
    Alert.alert('Contribuir Agora', 'Escolha uma ação', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Pagar com cartão', onPress: async () => {
        // simulate a payment flow: ensure 'Você' participant exists and mark paid
        navigation.navigate('CardRegistration');
        // also mark user as paid locally for demo purposes
        setParticipants((prev) => {
          const meIdx = prev.findIndex(p => p.id === 'you');
          if (meIdx >= 0) {
            const copy = [...prev];
            copy[meIdx] = { ...copy[meIdx], status: 'paid', paidAmount: (copy[meIdx].paidAmount || 0) + contribution };
            return copy;
          }
          // add user as a new participant at the end
          return [...prev, { id: 'you', name: 'Você', order: prev.length + 1, status: 'paid', paidAmount: contribution }];
        });
      }},
      { text: 'Pagar mais tarde', style: 'default' },
    ]);
  };

  const onHistory = () => {
    // Navigate to a history or expenses screen
    navigation.navigate('Expenses');
  };

  const onCalculator = () => {
    // Navigate to the calculator screen
    navigation.navigate('KixikilaCalculator');
  };

  const onInvite = () => {
    // Navigate to the invite screen
    navigation.navigate('KixikilaInvite');
  };

  const onViewRules = () => {
    Alert.alert('Regras da Kixikila', 'Pagamento semanal\nMultas por atraso\nOrdem fixa\nValores fixos');
  };

  const viewParticipantDetails = (p: Participant) => {
    Alert.alert('Detalhes', `${p.name}\nOrdem: ${p.order}\nEstado: ${p.status}\nValor pago: Kz ${p.paidAmount}`);
  };

  const renderParticipant = ({ item }: { item: Participant }) => {
    const statusIcon = item.status === 'paid' ? 'checkmark-circle' : item.status === 'pending' ? 'time' : 'close-circle';
    const statusColor = item.status === 'paid' ? '#2ECC71' : item.status === 'pending' ? '#F59E0B' : '#EF4444';

    return (
      <View style={styles.partRow}>
        <View style={styles.partLeft}>
          <View style={styles.avatar}>{/* placeholder */}
            <Text style={styles.avatarText}>{item.name.split(' ')[0][0]}</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.partName}>{item.order}. {item.name}</Text>
            <Text style={styles.partSmall}>Valor: Kz {item.paidAmount}</Text>
          </View>
        </View>

        <View style={styles.partRight}>
          <Ionicons name={statusIcon as any} size={20} color={statusColor} />
          <TouchableOpacity style={styles.detailButton} onPress={() => viewParticipantDetails(item)}>
            <Text style={styles.detailButtonText}>Ver detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const headerComponent = () => (
    <>
      {/* Header (no top nav) */}

      {/* Main Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kixikila Digital</Text>
          <Text style={styles.subtitle}>Poupança Comunitária e Rotativa</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.iconWrap}>
          <FontAwesome5 name="sync-alt" size={20} color={colors.darkBlue} />
        </View>
      </View>

      {/* Summary */}
      <View style={styles.card}>
        <Text style={styles.groupName}>{groupName}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Participantes</Text>
          <Text style={styles.summaryValue}>{participants.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Contribuição</Text>
          <Text style={styles.summaryValue}>Kz {contribution} / ciclo</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total esperado</Text>
          <Text style={styles.summaryValue}>Kz {totalExpected}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Próxima Rotação</Text>
          <Text style={styles.summaryValue}>{nextReceiver}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Status</Text>
          <Text style={styles.summaryValue}>{status}</Text>
        </View>
      </View>

      {/* Participants List Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Participantes</Text>
        <Text style={styles.sectionHint}>Ordem · Estado · Valor pago</Text>
      </View>
    </>
  );

  const footerComponent = () => (
    <>
      {/* My Position */}
      <View style={styles.card}>
        <Text style={styles.myTitle}>📌 A Tua Posição</Text>
        <Text style={styles.myText}>→ Vais receber na {myPosition.turnsLeft}ª volta</Text>
        <Text style={styles.myText}>→ Data prevista: {myPosition.expectedDate}</Text>
        <Text style={styles.myText}>→ Já contribuíste: Kz {myPosition.totalContributed}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onContributeNow}>
          <Text style={styles.actionText}>📥 Contribuir Agora</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onHistory}>
          <Text style={styles.actionText}>📜 Histórico</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onCalculator}>
          <Text style={styles.actionText}>🧮 Calculadora</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onInvite}>
          <Text style={styles.actionText}>🤝 Convidar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onViewRules}>
          <Text style={styles.actionText}>👁 Ver Regras</Text>
        </TouchableOpacity>
      </View>

      {/* Cycle Details Toggle */}
      <TouchableOpacity style={styles.detailsToggle} onPress={() => setShowCycleDetails((s) => !s)}>
        <Text style={styles.detailsToggleText}>{showCycleDetails ? 'Ocultar detalhes do ciclo' : 'Ver detalhes do ciclo'}</Text>
      </TouchableOpacity>

      {showCycleDetails && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes do Ciclo</Text>
          <Text style={styles.myText}>Ciclo Atual: 3/{cycles} participantes pagos</Text>
          <Text style={styles.myText}>Tempo limite: 24 horas restantes</Text>
          <Text style={styles.myText}>Próximo a receber: {nextReceiver}</Text>
          <Text style={styles.myText}>Valor a ser distribuído: Kz {contribution * participants.length}</Text>
          <Text style={styles.myText}>Multas aplicadas: 2 (ver lista)</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={participants}
        keyExtractor={(i) => i.id}
        renderItem={renderParticipant}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Kixikila bottom nav (fixed above global bottom nav) */}
      <View style={globalStyles.navBar}>
        <TouchableOpacity style={globalStyles.navItem} onPress={() => navigation.navigate('Wallet')}>
          <NavIcon screen="Wallet" active={false} size={22} />
          <Text style={globalStyles.navLabel}>Carteira</Text>
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.navItem} onPress={() => navigation.navigate('Expenses')}>
          <NavIcon screen="Expenses" active={false} size={22} />
          <Text style={globalStyles.navLabel}>Gastos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.navItem} onPress={() => navigation.navigate('Kixikila')}>
          <NavIcon screen="Kixikila" active={false} size={22} />
          <Text style={globalStyles.navLabel}>Kixikila</Text>
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.navItem} onPress={() => navigation.navigate('Profile')}>
          <NavIcon screen="Profile" active={false} size={22} />
          <Text style={globalStyles.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 60 },
  headerTop: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0 },
  backButton: { color: colors.secondary, fontWeight: '700', fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.darkBlue },
  subtitle: { color: colors.lightText, marginTop: 2 },
  iconWrap: { backgroundColor: colors.background, padding: 8, borderRadius: 10 },
  card: { backgroundColor: colors.white, margin: 20, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  groupName: { fontSize: 16, fontWeight: '700', color: colors.darkBlue, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: colors.lightText },
  summaryValue: { fontWeight: '700', color: colors.darkBlue },
  sectionHeader: { paddingHorizontal: 20, marginTop: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.darkBlue },
  sectionHint: { color: colors.lightText, marginTop: 4 },
  partRow: { backgroundColor: colors.background, padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20 },
  partLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  partName: { fontWeight: '700', color: colors.darkBlue },
  partSmall: { color: colors.lightText, marginTop: 4 },
  partRight: { alignItems: 'flex-end' },
  detailButton: { marginTop: 8 },
  detailButtonText: { color: colors.secondary, fontWeight: '700' },
  myTitle: { fontSize: 16, fontWeight: '700', color: colors.darkBlue, marginBottom: 8 },
  myText: { color: colors.darkBlue, fontWeight: '600', marginBottom: 6 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, paddingHorizontal: 20 },
  actionBtn: { backgroundColor: colors.white, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', width: '30%', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  actionText: { color: colors.darkBlue, fontWeight: '700', textAlign: 'center' },
  detailsToggle: { alignItems: 'center', marginTop: 12 },
  detailsToggleText: { color: colors.secondary, fontWeight: '700' },
  topNavBar: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  topNavItem: { alignItems: 'center', paddingHorizontal: 6 },
  topNavLabel: { fontSize: 12, color: colors.darkBlue, marginTop: 2, fontWeight: '600' },
});
