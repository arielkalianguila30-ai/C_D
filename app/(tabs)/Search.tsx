import React, { useEffect } from 'react';
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useCompanies } from '../context/CompaniesContext';
import CompanyCard from '../components/CompanyCard';
import { useTheme } from '../context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { useBottomNav } from '../context/BottomNavContext';

export default function SearchScreen() {
  const router = useRouter();
  const { companies } = useCompanies();
  const { colors } = useTheme();
  const { setVisible } = useBottomNav();
  const [query, setQuery] = React.useState('');

  useEffect(() => {
    // hide bottom nav while on search
    setVisible(false);
    return () => setVisible(true);
  }, []);

  const results = companies.filter(c =>
    c.nome.toLowerCase().includes(query.toLowerCase()) ||
    c.descricao.toLowerCase().includes(query.toLowerCase()) ||
    (c.servicos?.some(s => s.toLowerCase().includes(query.toLowerCase())) ?? false)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { setVisible(true); (router as any).push('/inicial'); }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}> 
          <TextInput
            placeholder="Pesquisar locais"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            style={[styles.input, { color: colors.text }]}
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CompanyCard company={item} onPress={() => (router as any).push(`/CompanyDetails?id=${item.id}`)} />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    padding: 12,
    borderRadius: 10,
    margin: 12,
  },
  input: { fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 12 : 0,
    paddingHorizontal: 12,
  },
  backButton: {
    marginRight: 8,
    padding: 8,
  },
});
