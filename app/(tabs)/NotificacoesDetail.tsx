import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text } from '../../components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function NotificacoesDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificação</Text>
      <Text style={styles.meta}>ID: {id}</Text>
      <Text style={styles.body}>
        Aqui vão os detalhes completos da notificação. No app real, busque o conteúdo
        pelo ID e mostre o título, corpo, data e possíveis ações (compartilhar, abrir mapa, etc.).
      </Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  meta: { fontSize: 12, color: '#666', marginBottom: 12 },
  body: { fontSize: 15, color: '#333' },
  backButton: { marginTop: 24, padding: 12, backgroundColor: '#1976d2', borderRadius: 8 },
  backText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});
