import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/colors';
import { detectCardBrand, detectBankByBIN, maskCardNumber, unmaskCardNumber } from '../utils/cardUtils';

interface CardItem {
  id: string;
  number: string;
  holder: string;
  expiry?: string;
  bank?: string;
  brand?: string;
  enabled?: boolean;
}

export const CardsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [cards, setCards] = useState<CardItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('@cards_v1');
        const arr = stored ? JSON.parse(stored) : [];
        setCards(arr);
      } catch (err) {
        console.error('Erro ao carregar cartões', err);
      }
    };

    const unsubscribe = navigation.addListener('focus', load);
    load();
    return unsubscribe;
  }, [navigation]);

  const addCard = () => {
    navigation.navigate('CardRegistration');
  };

  const removeCard = (id: string) => {
    Alert.alert('Remover cartão', 'Deseja remover este cartão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            const next = cards.filter((x) => x.id !== id);
            setCards(next);
            await AsyncStorage.setItem('@cards_v1', JSON.stringify(next));
          } catch (err) {
            console.error('Erro ao remover cartão', err);
          }
        },
      },
    ]);
  };

  const toggleEnabled = (id: string) => {
    const next = cards.map((card) => (card.id === id ? { ...card, enabled: !card.enabled } : card));
    setCards(next);
    AsyncStorage.setItem('@cards_v1', JSON.stringify(next)).catch((err) =>
      console.error('Erro ao atualizar cartão', err),
    );
  };

  const renderCard = ({ item }: { item: CardItem }) => {
    const brandInfo = detectCardBrand(item.number);
    const bankInfo = detectBankByBIN(item.number);
    const masked = maskCardNumber(unmaskCardNumber(item.number));

    return (
      <TouchableOpacity style={styles.cardRow} onPress={() => navigation.navigate('Wallet', { selectedCard: item })}>
        <View style={styles.left}>
          <View style={styles.brandBubble}>
            <Text style={styles.brandText}>{brandInfo.brand[0] || '?'}</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.holderText}>{item.holder}</Text>
            <Text style={styles.numberText}>{masked}</Text>
            <Text style={styles.smallText}>{bankInfo ? bankInfo.bank : item.bank || 'Banco desconhecido'}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <TouchableOpacity style={[styles.toggleButton, item.enabled ? styles.enabled : styles.disabled]} onPress={() => toggleEnabled(item.id)}>
            <Text style={styles.toggleText}>{item.enabled ? 'Ativo' : 'Bloqueado'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton} onPress={() => removeCard(item.id)}>
            <Text style={styles.smallButtonText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>⬅ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meus Cartões</Text>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(i) => i.id}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={addCard}>
          <Text style={styles.addButtonText}>Adicionar Cartão</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  back: { color: colors.secondary, marginRight: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.darkBlue },
  cardRow: { backgroundColor: colors.background, padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center' },
  brandBubble: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  brandText: { color: colors.white, fontWeight: '700' },
  holderText: { fontWeight: '700', color: colors.darkBlue },
  numberText: { color: colors.lightText, marginTop: 2 },
  smallText: { color: colors.lightText, marginTop: 4, fontSize: 12 },
  right: { alignItems: 'flex-end' },
  toggleButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 },
  enabled: { backgroundColor: '#E6F9F4' },
  disabled: { backgroundColor: '#FFEDED' },
  toggleText: { fontWeight: '700', color: colors.darkBlue },
  smallButton: { paddingVertical: 6, paddingHorizontal: 10 },
  smallButtonText: { color: colors.secondary, fontWeight: '700' },
  footer: { position: 'absolute', left: 20, right: 20, bottom: 30 },
  addButton: { backgroundColor: colors.secondary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  addButtonText: { color: colors.white, fontWeight: '700' },
});
