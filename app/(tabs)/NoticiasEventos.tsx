import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { View, Text } from '../../components/Themed';
import { useRouter } from 'expo-router';

type NewsItem = {
  id: string;
  type: 'Notícia' | 'Evento';
  title: string;
  summary: string;
  date: string;
  location?: string;
};

const data: NewsItem[] = [
  {
    id: 'n1',
    type: 'Notícia',
    title: 'Campanha de Reciclagem Comunitária',
    summary: 'A nova campanha visa aumentar a taxa de reciclagem local com pontos de coleta extras.',
    date: '2025-11-05',
  },
  {
    id: 'n2',
    type: 'Evento',
    title: 'Formação: Gestão de Resíduos para Pequenos Negócios',
    summary: 'Workshop gratuito para empreendedores sobre gestão eficiente e redução de custos.',
    date: '2025-11-20',
    location: 'Centro Cultural Municipal',
  },
  {
    id: 'n3',
    type: 'Evento',
    title: 'Feira de Economia Solidária',
    summary: 'Mostre seus produtos, conecte-se com clientes e parceiros locais.',
    date: '2025-12-02',
    location: 'Praça Central',
  },
];

export default function NoticiasEventosScreen() {
  const router = useRouter();

  const openDetail = (id: string) => {
    router.push({ pathname: '/NoticiasEventosDetail', params: { id } } as any);
  };

  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => openDetail(item.id)}>
      <View style={styles.cardHeader}>
        <Text style={[styles.badge, item.type === 'Evento' ? styles.eventBadge : styles.newsBadge]}>{item.type}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.summary}>{item.summary}</Text>
      {item.location ? <Text style={styles.location}>📍 {item.location}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Notícias e Eventos</Text>

      <FlatList
        data={data}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma notícia ou evento</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(128,128,128,0.04)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    color: '#fff',
    fontWeight: '600',
  },
  newsBadge: {
    backgroundColor: '#1976d2',
  },
  eventBadge: {
    backgroundColor: '#f39c12',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  summary: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: '#444',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
});
