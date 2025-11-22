import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../styles/colors';

interface SavingsGoalScreenProps {
  navigation: any;
}

export const SavingsGoalScreen: React.FC<SavingsGoalScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [initialValue, setInitialValue] = useState('');
  const [periodicity, setPeriodicity] = useState('Mensal');
  const [depositValue, setDepositValue] = useState('');
  const [motivation, setMotivation] = useState('');
  const [category, setCategory] = useState('Pessoal');

  const [goalCreated, setGoalCreated] = useState(false);
  const [savedAmount, setSavedAmount] = useState<number>(0);

  const createGoal = () => {
    if (!name.trim() || !totalValue) {
      Alert.alert('Preencha o nome e o valor total da meta');
      return;
    }

    setSavedAmount(Number(initialValue || 0));
    setGoalCreated(true);
  };

  const addDeposit = () => {
    const v = Number(depositValue || 0);
    if (v <= 0) {
      Alert.alert('Valor inválido');
      return;
    }
    setSavedAmount((s) => s + v);
    setDepositValue('');
  };

  const withdraw = () => {
    Alert.alert('Resgatar', 'Deseja resgatar parte do valor?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => setSavedAmount(0) },
    ]);
  };

  const getProgress = () => {
    const total = Number(totalValue || 0);
    if (total === 0) return 0;
    return Math.min(100, Math.round((savedAmount / total) * 100));
  };

  const daysRemaining = () => {
    if (!deadline) return '-';
    const now = new Date();
    const d = new Date(deadline);
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `${diff} dias` : 'Prazo ultrapassado';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>⬅ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Poupança</Text>
        </View>

        {!goalCreated ? (
          <View>
            <Text style={styles.label}>Prazo Final (AAAA-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2025-12-31" value={deadline} onChangeText={setDeadline} />

            <Text style={styles.label}>Valor Inicial (opcional)</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={initialValue} onChangeText={setInitialValue} />

            <Text style={styles.label}>Periodicidade do Depósito</Text>
            <View style={styles.rowButtons}>
              {['Diário', 'Semanal', 'Mensal'].map((p) => (
                <TouchableOpacity key={p} style={[styles.optionButton, periodicity === p && styles.optionButtonActive]} onPress={() => setPeriodicity(p)}>
                  <Text style={[styles.optionText, periodicity === p && styles.optionTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Valor do Depósito Regular (Kz)</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={depositValue} onChangeText={setDepositValue} />

            <Text style={styles.label}>Motivação (opcional)</Text>
            <TextInput style={styles.input} placeholder="Ex: Para ter liberdade financeira" value={motivation} onChangeText={setMotivation} />

            <Text style={styles.label}>Categoria</Text>
            <View style={styles.rowButtons}>
              {['Educação', 'Negócio', 'Transporte', 'Pessoal'].map((c) => (
                <TouchableOpacity key={c} style={[styles.optionButton, category === c && styles.optionButtonActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.optionText, category === c && styles.optionTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={createGoal}>
              <Text style={styles.createButtonText}>Criar Poupança</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>{name}</Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${getProgress()}%` }]} />
              </View>

              <View style={styles.progressNumbers}>
                <Text style={styles.progressText}>Saldo poupado: {savedAmount} Kz</Text>
                <Text style={styles.progressText}>Falta: {Math.max(0, Number(totalValue || 0) - savedAmount)} Kz</Text>
              </View>

              <Text style={styles.progressText}>Concluído: {getProgress()}%</Text>
              <Text style={styles.progressText}>Dias restantes: {daysRemaining()}</Text>

              <View style={styles.rowButtons}
              >
                <TouchableOpacity style={styles.depositButton} onPress={() => {
                  // show quick deposit input (iOS only Alert.prompt) - typed param to satisfy TS
                  if (Alert.prompt) {
                    Alert.prompt('Adicionar Depósito', 'Valor (Kz)', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Adicionar', onPress: (v: string | undefined) => {
                        const val = Number(v || 0);
                        if (val > 0) setSavedAmount(s => s + val);
                      }}
                    ] as any);
                  } else {
                    // On platforms without Alert.prompt, fallback to the deposit input field below
                    Alert.alert('Atenção', 'Use o campo "Valor do Depósito Regular" para adicionar um depósito rápido.');
                  }
                }}>
                  <Text style={styles.depositButtonText}>Adicionar Depósito</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.withdrawButton} onPress={withdraw}>
                  <Text style={styles.withdrawButtonText}>Resgatar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={() => navigation.goBack()}>
              <Text style={styles.createButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  back: { color: colors.secondary, marginRight: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.darkBlue },
  label: { fontSize: 14, fontWeight: '600', color: colors.darkBlue, marginTop: 12 },
  input: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, backgroundColor: colors.background, marginTop: 8 },
  rowButtons: { flexDirection: 'row', marginTop: 8, marginBottom: 12, flexWrap: 'wrap' },
  optionButton: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginRight: 8, marginBottom: 8 },
  optionButtonActive: { backgroundColor: '#E3F2FD', borderColor: colors.secondary },
  optionText: { color: colors.darkBlue, fontWeight: '600' },
  optionTextActive: { color: colors.secondary },
  createButton: { marginTop: 16, backgroundColor: colors.secondary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  createButtonText: { color: colors.white, fontWeight: '700' },
  progressCard: { backgroundColor: colors.background, padding: 16, borderRadius: 12, marginBottom: 16 },
  progressTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  progressBarBackground: { height: 12, backgroundColor: '#E6E6E6', borderRadius: 8, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: 12, backgroundColor: colors.secondary },
  progressNumbers: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { color: colors.darkBlue, fontWeight: '600', marginBottom: 6 },
  depositButton: { backgroundColor: colors.secondary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginRight: 8 },
  depositButtonText: { color: colors.white, fontWeight: '700' },
  withdrawButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.secondary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  withdrawButtonText: { color: colors.secondary, fontWeight: '700' },
});
