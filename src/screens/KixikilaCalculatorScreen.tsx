import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../styles/colors';

export const KixikilaCalculatorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [participants, setParticipants] = useState<string>('12');
  const [contribution, setContribution] = useState<string>('5000');
  const [cycles, setCycles] = useState<string>('12');

  const calculate = () => {
    const np = Math.max(1, parseInt(participants || '0', 10));
    const c = Math.max(0, Number(contribution || '0'));
    const cyc = Math.max(1, parseInt(cycles || '1', 10));

    const willReceive = c * np; // naive per-cycle
    const willPayTotal = c * cyc;
    const percentGain = willPayTotal === 0 ? 0 : Math.round(((willReceive - willPayTotal) / willPayTotal) * 100);

    Alert.alert('Resultado', `Receberás por ciclo: Kz ${willReceive}\nPagarás no total: Kz ${willPayTotal}\nPercentagem de ganho: ${percentGain}%`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>⬅ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Calculadora da Kixikila</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Número de participantes</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={participants} onChangeText={setParticipants} />

        <Text style={styles.label}>Contribuição por ciclo (Kz)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={contribution} onChangeText={setContribution} />

        <Text style={styles.label}>Número de ciclos</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={cycles} onChangeText={setCycles} />

        <TouchableOpacity style={styles.button} onPress={calculate}>
          <Text style={styles.buttonText}>Calcular</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  back: { color: colors.secondary, marginRight: 12 },
  title: { fontSize: 18, fontWeight: '700', color: colors.darkBlue },
  form: { padding: 20 },
  label: { color: colors.darkBlue, fontWeight: '600', marginTop: 12 },
  input: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, marginTop: 8, backgroundColor: colors.background },
  button: { marginTop: 20, backgroundColor: colors.secondary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700' },
});
