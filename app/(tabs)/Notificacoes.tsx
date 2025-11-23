import React, { useCallback, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { View, Text } from '../../components/Themed';
import { useRouter } from 'expo-router';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  unread?: boolean;
};

const initialData: NotificationItem[] = [
  {
    id: '1',
    title: 'Novo empreendimento próximo a você',
    body: 'A Empresa Verde abriu um novo ponto de coleta a 2 km da sua localização.',
    date: '2025-11-11',
    unread: true,
  },
  {
    id: '2',
    title: 'Promoção: desconto em produtos recicláveis',
    body: 'Parceria com o Mercado Sustentável: até 20% off em itens selecionados.',
    date: '2025-11-09',
    unread: true,
  },
  {
    id: '3',
    title: 'Evento: Feira de Economia Circular',
    body: 'Participe da feira local com oficinas e palestras gratuitas.',
    date: '2025-10-30',
    unread: false,
  },
];

export default function NotificacoesScreen() {
  const [items, setItems] = useState<NotificationItem[]>(initialData);
  const router = useRouter();

  const toggleRead = useCallback((id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, unread: false } : i)));
  }, []);

  const openDetail = useCallback((id: string) => {
    toggleRead(id);
  // navigate to detail screen, pass id as query param
  router.push({ pathname: '/NotificacoesDetail', params: { id } } as any);
  }, [router, toggleRead]);

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.item, item.unread ? styles.unread : undefined]}
      onPress={() => openDetail(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.body}>{item.body}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Notificações</Text>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma notificação</Text>}
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
  item: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#2a9d8f',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  body: {
    fontSize: 14,
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
});
