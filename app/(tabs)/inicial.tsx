import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, BackHandler, Dimensions, Alert, ImageBackground, Linking, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import BottomNavigation from '../components/BottomNavigation';
import { useLanguage } from '../context/LanguageContext';
import { useBottomNav } from '../context/BottomNavContext';
import { useFavorites } from '../context/FavoritesContext';
import useOpenLocation from '../components/useOpenLocation';
import { useCompanies } from '../context/CompaniesContext';
import CompanyCard from '../components/CompanyCard';

const { width, height } = Dimensions.get('window');

export default function MenuPrincipal() {
  const router = useRouter();
  const [searchText, setSearchText] = React.useState('');
  const searchInputRef = React.useRef<TextInput>(null);
  const [shouldFocus, setShouldFocus] = React.useState(false);
  const { favorites, isFavorite, toggleFavorite, count } = useFavorites();
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const { active, setActive } = useBottomNav();
  const { setVisible } = useBottomNav();
  const params: any = useLocalSearchParams();
  
  const { openLocation } = useOpenLocation();
  const carouselRef = React.useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Função para focar no campo de busca
  const focusSearchInput = () => {
    setShouldFocus(true);
  };

  // Efeito para focar quando a tela montar
  // Efeito para focar quando shouldFocus mudar
  React.useEffect(() => {
    if (shouldFocus && searchInputRef.current) {
      searchInputRef.current.focus();
      setShouldFocus(false);
    }
  }, [shouldFocus]);

  // If we came from CadastroEmpreendimento with highlight params, open map centered
  React.useEffect(() => {
    try {
      const lat = params.highlightLat as string | undefined;
      const lng = params.highlightLng as string | undefined;
      const name = params.highlightName as string | undefined;
      if (lat && lng) {
        // ensure bottom nav hidden and go to map with params
        setActive('mapa');
        setVisible(false);
        (router as any).push(`/(tabs)/MapScreen?highlightLat=${lat}&highlightLng=${lng}&highlightName=${encodeURIComponent(name || '')}`);
      }
    } catch (e) {
      // ignore malformed params
    }
  }, [params]);
  
  const { companies } = useCompanies();
  const anunciosFiltrados = companies.filter(c => c.nome.toLowerCase().includes(searchText.toLowerCase()) || c.endereco.toLowerCase().includes(searchText.toLowerCase()));

  // Auto-scroll carousel every 3 seconds
  React.useEffect(() => {
    const carouselData = companies.slice(0, 6);
    if (carouselData.length === 0) return;
    
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselData.length;
      setCurrentIndex(nextIndex);
      carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, companies]);

  const handleAnuncioPress = () => {
    Alert.alert(
      "Acesso Restrito",
      "Inicie sessão para mostrar a localização.",
      [
        { text: "Entrar", onPress: () => router.push("/Login2") },
        { text: "Cancelar", style: "cancel" }
      ]
    );
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
        {/* 🔍 Barra de Pesquisa */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }] }>
          <Feather name="search" size={20} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            ref={searchInputRef}
            placeholder={'Pesquisar locais'}
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => { setVisible(false); (router as any).push('/(tabs)/Search'); }}
          />
      </View>

      {/* 📱 Main scrollable content (carousel + companies) */}
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }} style={{ flex: 1 }}>
        {/* 🌟 Bloco de Destaques (Carousel) */}
        <View style={styles.highlightsCarouselContainer}>
          <FlatList
            ref={carouselRef}
            data={companies.slice(0, 6)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.highlightCard}
                onPress={() => (router as any).push(`/CompanyDetails?id=${item.id}`)}
              >
                <Image source={item.imagem} style={styles.highlightImage} />
                <View style={styles.highlightOverlay}>
                  <Text style={styles.highlightName}>{item.nome}</Text>
                </View>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const offset = event.nativeEvent.contentOffset.x;
              const index = Math.round(offset / width);
              setCurrentIndex(index);
            }}
            snapToInterval={width}
            decelerationRate="fast"
          />
        </View>

        {/* 📰 Área de Anúncios */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.titulo, { color: colors.text }]}>{translations.places}</Text>
          
          {anunciosFiltrados.length > 0 ? (
            <FlatList
              data={anunciosFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CompanyCard
                  company={item}
                  onPress={() => (router as any).push(`/CompanyDetails?id=${item.id}`)}
                />
              )}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.mensagemContainer}>
              <Text style={[styles.mensagemNaoEncontrado, { color: colors.muted }]}>{translations.noResults}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 🔘 Botões dos icones */}
      <BottomNavigation />
      </View>
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
    // ajuste fino: -10px para não ficar muito alto
    paddingTop: 100,
  },
  anuncioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  anuncioInfo: {
    flex: 1,
  },
  favoritoButton: {
    padding: 8,
    marginLeft: 8,
  },
  iconButtonWithBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  iconText: {
    fontSize: 12,
    marginTop: 4,
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
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  Sig: {
    fontSize: 20,
    color: "#2fd24a",
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 4,
  },
  exitButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    // reduzido para não empurrar a busca além do alinhamento desejado
    marginTop: 0,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  anunciosContainer: {
    paddingVertical: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
  anuncioTitulo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  anuncioTexto: {
    fontSize: 14,
    marginTop: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  botao: {
    flex: 1,
    marginHorizontal: 10,
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2fd24a",
  },
  textoBotao: {
    color: "#ffffffff",
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  socialRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 12 
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  whiteCard: {
    
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  highlightsCarouselContainer: {
    height: 200,
    marginVertical: 12,
  },
  highlightCard: {
    width: width,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  highlightImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  highlightOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    paddingBottom: 16,
  },
  highlightName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
