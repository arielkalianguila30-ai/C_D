import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Linking, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCompanies } from '../context/CompaniesContext';
import { useWatchedCompanies } from '../context/WatchedCompaniesContext';
import { Feather } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import useOpenLocation from '../components/useOpenLocation';
import { Share } from 'react-native';
import { useRecent } from '../context/RecentContext';

export default function CompanyDetails() {
  const router = useRouter();
  const params: any = useLocalSearchParams();
  const id = params?.id as string | undefined;
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const { getById } = useCompanies();
  const { watchedCompanies, addWatchedCompany, removeWatchedCompany } = useWatchedCompanies();

  const company = id ? getById(id) : undefined;
  if (!company) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{translations.notFound || 'Empresa não encontrada'}</Text>
      </View>
    );
  }

  const isWatched = watchedCompanies.some(w => w.id === company.id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openLocation } = useOpenLocation();
  const { addRecent } = useRecent();
  const fav = isFavorite(company.id);

  const toggleWatch = async () => {
    try {
      if (isWatched) await removeWatchedCompany(company.id);
      else await addWatchedCompany({ id: company.id, nome: company.nome, tipo: 'Reciclagem Geral', ultimaVisita: '', logo: company.imagem });
    } catch (e) {
      Alert.alert(translations.error || 'Erro', translations.tryAgain || 'Tente novamente');
    }
  };

  React.useEffect(() => {
    // add to recently viewed in real time
    if (company?.id) {
      addRecent(company.id);
    }
  }, [company?.id]);

  const handleShare = async () => {
    try {
      const text = `${company.nome} - ${company.endereco}`;
      if (company.latitude && company.longitude) {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${company.latitude},${company.longitude}`;
        await Share.share({ message: `${text}\n${mapsUrl}` });
      } else {
        await Share.share({ message: text });
      }
    } catch (e) {
      Alert.alert(translations.error || 'Erro', translations.tryAgain || 'Tente novamente');
    }
  };

  const onDirections = () => {
    // open MapScreen and request a routing view from user -> company
    (router as any).push(`/MapScreen?destinationLat=${company.latitude}&destinationLng=${company.longitude}&route=true`);
  };

  const onSave = async () => {
    await toggleFavorite(company.id);
    Alert.alert(translations.saved || 'Guardado', fav ? (translations.removed || 'Removido dos favoritos') : (translations.saved || 'Guardado'));
  };

  const onNearby = () => {
    // open map and center on this company; MapScreen can read highlight params
    (router as any).push(`/MapScreen?highlightLat=${company.latitude}&highlightLng=${company.longitude}&nearby=true`);
  };

  const onSendToPhone = async () => {
    try {
      const text = `${company.nome} - ${company.endereco}`;
      if (company.telefone) {
        const smsUrl = `sms:${company.telefone}?body=${encodeURIComponent(text)}`;
        const can = await Linking.canOpenURL(smsUrl);
        if (can) await Linking.openURL(smsUrl);
        else await Share.share({ message: text });
      } else {
        await Share.share({ message: text });
      }
    } catch (e) {
      Alert.alert(translations.error || 'Erro', translations.tryAgain || 'Tente novamente');
    }
  };

  // Rating state
  const [rating, setRating] = React.useState<number>(0);
  const [reviewText, setReviewText] = React.useState<string>('');

  const canSubmitReview = rating > 0 && reviewText.trim().length > 0;

  const submitReview = () => {
    if (!canSubmitReview) return;
    // In a real app we'd persist the review to backend here
    Alert.alert(company.nome, 'Agradecemos Pele sua avaliação.');
    // reset
    setRating(0);
    setReviewText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Top bar with explicit back-to-inicial */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => (router as any).push('/inicial')} style={styles.iconButton}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Image source={company.imagem} style={styles.image} />

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]}>{company.nome}</Text>
          <View style={styles.ratingRow}>
            <Text style={{ color: '#f4c542', marginRight: 6 }}>4,8</Text>
            <Feather name="star" size={14} color="#f4c542" />
            <Text style={[styles.reviews, { color: colors.muted }]}> (4)</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={{ color: colors.muted }}>Universidade ·</Text>
          <Feather name="user" size={16} color={colors.muted} style={{ marginLeft: 6 }} />
        </View>

        {/* action icons row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionItem} onPress={onDirections}>
            <View style={styles.actionCircle}><Feather name="navigation" size={20} color={colors.primary} /></View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Direções</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onSave}>
            <View style={styles.actionCircle}><Feather name="bookmark" size={20} color={colors.primary} /></View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onNearby}>
            <View style={styles.actionCircle}><Feather name="map" size={20} color={colors.primary} /></View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Imediações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={onSendToPhone}>
            <View style={styles.actionCircle}><Feather name="phone" size={20} color={colors.primary} /></View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Enviar para telemóvel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
            <View style={styles.actionCircle}><Feather name="share-2" size={20} color={colors.primary} /></View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Partilhar</Text>
          </TouchableOpacity>
        </View>

        {/* tab row */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={[styles.tabText, { color: colors.primary }]}>Vista geral</Text>
            <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={[styles.tabText, { color: colors.muted }]}>Críticas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Text style={[styles.tabText, { color: colors.muted }]}>Acerca de</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Vista geral</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>{company.descricao}</Text>

        {company.servicos && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Serviços</Text>
            {company.servicos.map((s, i) => (
              <Text key={i} style={[styles.paragraph, { color: colors.text }]}>• {s}</Text>
            ))}
          </>
        )}

        {company.telefone && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Contacto</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>{company.telefone}</Text>
          </>
        )}

        {company.horario && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Horário</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>{company.horario}</Text>
          </>
        )}

        {/* Avaliação do utilizador */}
        <View style={{ height: 12 }} />
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Deixe a sua avaliação</Text>
        <View style={styles.rateRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)} style={{ paddingHorizontal: 6 }}>
              <Feather name="star" size={28} color={s <= rating ? '#f4c542' : '#ccc'} />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.reviewInput, { color: colors.text, borderColor: '#e0e0e0', backgroundColor: colors.surface }]}
          placeholder="Escreva a sua avaliação..."
          placeholderTextColor={'#999'}
          multiline
          numberOfLines={4}
          value={reviewText}
          onChangeText={setReviewText}
        />

        <TouchableOpacity
          style={[styles.reviewButton, !canSubmitReview && { opacity: 0.5 }]}
          onPress={submitReview}
          disabled={!canSubmitReview}
        >
          <Text style={styles.reviewButtonText}>Avaliar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48, // extra padding for status bar
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  image: { 
    width: '100%', 
    height: 200, 
    borderRadius: 8, 
    marginBottom: 12 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    flex: 1 
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reviews: {
    fontSize: 12,
    marginLeft: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  address: { 
    marginTop: 6, 
    marginBottom: 12 
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginTop: 12, 
    marginBottom: 6 
  },
  paragraph: { 
    fontSize: 14, 
    lineHeight: 20 
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12
  },
  actionItem: {
    alignItems: 'center',
    flex: 1
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e9f5f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  actionLabel: {
    fontSize: 12,
    textAlign: 'center'
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  tabText: {
    fontSize: 14,
  },
  tabIndicator: {
    height: 2,
    width: '100%',
    marginTop: 6
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  reviewButton: {
    marginTop: 12,
    backgroundColor: '#2fd24a',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
