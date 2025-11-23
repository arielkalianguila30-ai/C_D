import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';
import { useCompanies } from '../context/CompaniesContext';
import CompanyCard from '../components/CompanyCard';
import { useTheme } from '../context/ThemeContext';

export default function Destaques() {
  const { companies } = useCompanies();
  const { colors } = useTheme();

  // Derive ratings deterministically from id so examples are stable
  const companiesWithRating = useMemo(() => companies.map(c => ({
    ...c,
    rating: 3 + (parseInt(c.id, 10) % 3), // yields 3..5
    popularityScore: (c.servicos?.length ?? 0) + (c.nome.length % 5),
    recentScore: parseInt(c.id, 10),
  })), [companies]);

  const topRated = useMemo(() => [...companiesWithRating].sort((a, b) => b.rating - a.rating).slice(0, 6), [companiesWithRating]);
  const populares = useMemo(() => [...companiesWithRating].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 6), [companiesWithRating]);
  const recentes = useMemo(() => [...companiesWithRating].sort((a, b) => b.recentScore - a.recentScore).slice(0, 6), [companiesWithRating]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={[{ title: 'Melhor Avaliadas', data: topRated }, { title: 'Populares', data: populares }, { title: 'Recentes', data: recentes }]}
        keyExtractor={(section, idx) => `section-${idx}`}
        renderItem={({ item }) => null}
        ListHeaderComponent={() => (
          <View style={styles.sectionList}>
            <Text style={[styles.title, { color: colors.text }]}>Destaques</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Melhor Avaliadas</Text>
            {topRated.map(c => (
              <CompanyCard key={c.id} company={c} onPress={() => null} />
            ))}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Populares</Text>
            {populares.map(c => (
              <CompanyCard key={c.id} company={c} onPress={() => null} />
            ))}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recentes</Text>
            {recentes.map(c => (
              <CompanyCard key={c.id} company={c} onPress={() => null} />
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionList: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
});
