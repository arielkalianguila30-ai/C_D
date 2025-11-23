import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSavedItems, ItemSalvo, PontoColeta, DicaSustentavel } from '../context/SavedItemsContext';

export default function ItensSalvos() {
  const router = useRouter();
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const { savedItems } = useSavedItems();
  const [itensSalvos] = React.useState<ItemSalvo[]>(savedItems.length > 0 ? savedItems : [
    {
      id: '1',
      tipo: 'Ponto de Coleta' as const,
      nome: 'EcoPonto Central',
      endereco: 'Av. Principal, 123',
      materiais: ['Plástico', 'Metal', 'Vidro'],
      dataSalvo: '01/11/2025',
    },
    {
      id: '2',
      tipo: 'Dica Sustentável' as const,
      titulo: 'Como separar resíduos corretamente',
      categoria: 'Reciclagem',
      dataSalvo: '31/10/2025',
    },
  ]);

  const renderItem = ({ item }: { item: ItemSalvo }) => (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.surface }]}
  onPress={() => Alert.alert(translations.comingSoon || 'Em breve', translations.comingSoon || 'Em breve')}
    >
      <View style={styles.itemHeader}>
        <MaterialIcons
          name={item.tipo === 'Ponto de Coleta' ? 'location-on' : 'lightbulb'}
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.itemTipo, { color: colors.primary }]}>{item.tipo}</Text>
      </View>

      <Text style={[styles.itemTitulo, { color: colors.text }]}> 
        {item.tipo === 'Ponto de Coleta' ? (item as PontoColeta).nome : (item as DicaSustentavel).titulo}
      </Text>

      {item.tipo === 'Ponto de Coleta' && (
        <>
          <Text style={[styles.itemEndereco, { color: colors.muted }]}>{(item as PontoColeta).endereco}</Text>
          <View style={styles.materiaisContainer}>
            {(item as PontoColeta).materiais.map((material: string, index: number) => (
              <View key={index} style={[styles.materialTag, { backgroundColor: colors.background }]}> 
                <Text style={[styles.materialText, { color: colors.primary }]}>{material}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {item.tipo === 'Dica Sustentável' && (
        <Text style={[styles.itemCategoria, { color: colors.muted }]}>{(item as DicaSustentavel).categoria}</Text>
      )}

      <Text style={[styles.dataSalvo, { color: colors.muted }]}>Salvo em: {item.dataSalvo}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/Perfil')}
        >
          <AntDesign name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>Itens Salvos</Text>
      </View>

      <FlatList
        data={itensSalvos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bookmark" size={50} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}> 
              Você ainda não tem itens salvos
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#2fd24a',
  },
  listContainer: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTipo: {
    fontSize: 14,
    color: '#2fd24a',
    marginLeft: 8,
    fontWeight: '500',
  },
  itemTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemEndereco: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  materiaisContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  materialTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  materialText: {
    color: '#2fd24a',
    fontSize: 12,
  },
  itemCategoria: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dataSalvo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
});