import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import BottomNavigation from '../components/BottomNavigation';

export default function AdminUsers() {
  const router = useRouter();
  const { users, removeUser, updateUser } = useAdmin();
  const { colors } = useTheme();

  const handleRemoveUser = (userId: string, userName: string) => {
    Alert.alert(
      'Eliminar Utilizador',
      `Tem certeza que deseja eliminar "${userName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            removeUser(userId);
            Alert.alert('Sucesso', 'Utilizador eliminado em tempo real');
          },
        },
      ]
    );
  };

  const handleToggleOnline = (userId: string, currentStatus: boolean) => {
    updateUser(userId, { isOnline: !currentStatus });
  };

  const handleAddUser = () => {
    router.push('/(tabs)/AdminRegisterUser' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Utilizadores Registados</Text>
      </View>

      {/* Botão adicionar utilizador */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddUser}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Adicionar Utilizador</Text>
      </TouchableOpacity>

      {/* Lista de utilizadores */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{item.nome || 'Sem nome'}</Text>
              <Text style={[styles.userEmail, { color: colors.muted }]}>{item.email}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: item.isOnline ? '#4CAF50' : '#BDBDBD' }]} />
                <Text style={[styles.statusText, { color: colors.muted }]}>
                  {item.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleToggleOnline(item.id, item.isOnline || false)}
              >
                <Feather 
                  name={item.isOnline ? 'pause' : 'play'} 
                  size={16} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleRemoveUser(item.id, item.nome || item.email)}
              >
                <Feather name="trash-2" size={16} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Nenhum utilizador registado</Text>
          </View>
        }
      />

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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  userEmail: { fontSize: 12, marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14 },
});
