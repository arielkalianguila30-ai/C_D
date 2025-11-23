import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCompanies } from '../context/CompaniesContext';
import { useTheme } from '../context/ThemeContext';
import BottomNavigation from '../components/BottomNavigation';

export default function AdminCompanies() {
  const router = useRouter();
  const { companies, removeCompany } = useCompanies();
  const { colors } = useTheme();

  const handleAddCompany = () => {
    router.push('/(tabs)/CadastroEmpreendimento' as any);
  };

  const handleRemoveCompany = (companyId: string, companyName: string) => {
    Alert.alert(
      'Eliminar Empresa',
      `Tem certeza que deseja eliminar "${companyName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            removeCompany(companyId);
            Alert.alert('Sucesso', 'Empresa eliminada em tempo real em todos os utilizadores');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gerenciar Empresas</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Botão adicionar empresa */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddCompany}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Adicionar Empresa</Text>
        </TouchableOpacity>

        {/* Lista de empresas */}
        {companies.map((item) => (
          <View key={item.id} style={[styles.companyCard, { backgroundColor: colors.surface }]}>
            <View style={styles.companyInfo}>
              <Text style={[styles.companyName, { color: colors.text }]}>{item.nome}</Text>
              <Text style={[styles.companyAddress, { color: colors.muted }]}>{item.endereco}</Text>
              <Text style={[styles.companyServices, { color: colors.muted }]}>
                {item.servicos?.join(', ') || 'Sem serviços'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemoveCompany(item.id, item.nome)}
            >
              <Feather name="trash-2" size={16} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  companyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  companyAddress: { fontSize: 12, marginBottom: 4 },
  companyServices: { fontSize: 11 },
  deleteButton: { padding: 8 },
});
