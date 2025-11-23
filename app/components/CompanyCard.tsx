import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { Company } from '../context/CompaniesContext';
import { useTheme } from '../context/ThemeContext';
import { useWatchedCompanies } from '../context/WatchedCompaniesContext';
import { useRouter } from 'expo-router';

type Props = {
  company: Company;
  onPress: () => void;
};

export default function CompanyCard({ company, onPress }: Props) {
  const { colors } = useTheme();
  const { watchedCompanies, addWatchedCompany, removeWatchedCompany } = useWatchedCompanies();

  const isWatched = watchedCompanies.some(w => w.id === company.id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(company.id);

  const toggleWatch = async () => {
    if (isWatched) {
      await removeWatchedCompany(company.id);
    } else {
      await addWatchedCompany({ id: company.id, nome: company.nome, tipo: 'Reciclagem Geral', ultimaVisita: '', logo: company.imagem });
    }
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]} onPress={onPress} activeOpacity={0.9}>
      <Image source={company.imagem} style={styles.image} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>{company.nome}</Text>
        <Text style={[styles.address, { color: colors.muted }]} numberOfLines={1}>{company.endereco}</Text>
        <Text style={[styles.desc, { color: colors.text }]} numberOfLines={2}>{company.descricao}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={styles.watchButton} onPress={toggleWatch}>
          <Feather name={isWatched ? 'eye' : 'eye-off'} size={20} color={isWatched ? colors.primary : colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.watchButton} onPress={() => toggleFavorite(company.id)}>
          <Feather name={fav ? 'heart' : 'heart'} size={20} color={fav ? colors.primary : colors.muted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  address: {
    fontSize: 13,
    marginTop: 2,
  },
  desc: {
    fontSize: 12,
    marginTop: 6,
  },
  watchButton: {
    padding: 8,
  },
});
