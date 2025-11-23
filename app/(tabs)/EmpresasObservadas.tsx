import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useWatchedCompanies } from '../context/WatchedCompaniesContext';

export default function EmpresasObservadas() {
  const router = useRouter();
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const { watchedCompanies } = useWatchedCompanies();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/Perfil')}
        >
          <AntDesign name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
  <Text style={[styles.title, { color: colors.primary }]}>{translations.watchedCompanies || 'Empresas Observadas'}</Text>
      </View>

      <FlatList
        data={watchedCompanies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.empresaCard}
            onPress={() => Alert.alert(translations.comingSoon || 'Em breve', translations.comingSoon || 'Em breve')}
          >
            <Image source={item.logo} style={styles.empresaLogo} />
            <View style={styles.empresaInfo}>
              <Text style={[styles.empresaNome, { color: colors.text }]}>{item.nome}</Text>
              <Text style={[styles.empresaTipo, { color: colors.muted }]}>{item.tipo}</Text>
              <Text style={[styles.ultimaVisita, { color: colors.muted }]}>Última visita: {item.ultimaVisita}</Text>
            </View>
            <Feather name="chevron-right" size={24} color={colors.muted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="eye-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              Você ainda não está observando nenhuma empresa
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
    // ajuste fino: -10px para alinhar com outras telas
    paddingTop: 100,
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
  empresaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 15,
  },
  empresaLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  empresaInfo: {
    flex: 1,
  },
  empresaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  empresaTipo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ultimaVisita: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
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