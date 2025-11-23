import { Feather, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useBottomNav } from '../context/BottomNavContext';
import useOpenLocation from '../components/useOpenLocation';
import BottomNavigation from '../components/BottomNavigation';
import { useCompanies } from '../context/CompaniesContext';

export default function FavoritosScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const { active, setActive } = useBottomNav();
  const { openLocation } = useOpenLocation();
  const { companies } = useCompanies();
  const locaisFavoritos = React.useMemo(() => companies.filter(c => favorites.some(f => String(f) === String(c.id))), [favorites, companies]);

  const removerFavorito = async (id: string | number) => {
    try {
      await toggleFavorite(id);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      Alert.alert("Erro", "Não foi possível remover o favorito");
    }
  };

  return (
  <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground 
        source={require('../../assets/images/Fundo.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
          <View style={styles.content}>
          <View style={styles.header}>
            
            <Text style={[styles.titulo, { color: colors.text }]}>{translations.yourFavorites}</Text>
          </View>
          
          <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
            {locaisFavoritos.length > 0 ? (
              <View style={[styles.favoritosContainer, { backgroundColor: colors.surface }]}>
                {locaisFavoritos.map(local => (
                  <TouchableOpacity 
                    key={local.id} 
                    style={[styles.anuncioCard, { backgroundColor: colors.surface }]}
                    onPress={() => (router as any).push(`/CompanyDetails?id=${local.id}`)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={local.imagem as any}
                      style={styles.anuncioImagem}
                    />
                    <View style={styles.anuncioHeader}>
                      <View style={styles.anuncioInfo}>
                        <Text style={[styles.anuncioTitulo, { color: colors.primary }]}>{local.nome}</Text>
                        <Text style={[styles.anuncioTexto, { color: colors.muted }]}>{local.endereco}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.favoritoButton}
                        onPress={() => removerFavorito(local.id)}
                      >
                        <FontAwesome
                          name="heart"
                          size={24}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.mensagemContainer}>
                <Text style={[styles.mensagemNaoEncontrado, { color: colors.muted }]}>{translations.noFavorites}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <BottomNavigation />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(47, 210, 74, 0.45)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    // ajuste fino: -10px para alinhar com inicial.tsx
    paddingTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
  },
  favoritosContainer: {
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  anuncioCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  anuncioImagem: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  anuncioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  anuncioInfo: {
    flex: 1,
  },
  anuncioTitulo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  anuncioTexto: {
    fontSize: 14,
    marginTop: 5,
  },
  favoritoButton: {
    padding: 8,
    marginLeft: 8,
  },
  mensagemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  mensagemNaoEncontrado: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

});