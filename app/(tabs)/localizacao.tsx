import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function LocalizacaoScreen() {
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const router = useRouter();
  const params: any = useLocalSearchParams();
  const fromParam = params?.from ? decodeURIComponent(params.from as string) : null;
  const latParam = params?.lat ? Number(params.lat) : undefined;
  const lngParam = params?.lng ? Number(params.lng) : undefined;

  const [loading, setLoading] = React.useState(true);
  const [region, setRegion] = React.useState<Region>({
    latitude: -8.838333, // Luanda approx
    longitude: 13.234444,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = React.useRef<MapView | null>(null);
  const locationSubscription = React.useRef<any>(null);

  // Sample ecoponto markers in Angola (example coordinates)
  const ecopontos = [
    { id: 'luanda-1', title: 'EcoPonto Luanda Centro', latitude: -8.838333, longitude: 13.234444 },
    { id: 'luanda-2', title: 'EcoPonto Maianga', latitude: -8.843333, longitude: 13.235000 },
    { id: 'benguela-1', title: 'EcoPonto Benguela', latitude: -12.576111, longitude: 13.405556 },
    { id: 'lobito-1', title: 'EcoPonto Lobito', latitude: -12.364722, longitude: 13.540278 },
    { id: 'huambo-1', title: 'EcoPonto Huambo', latitude: -12.776111, longitude: 15.739444 },
  ];

  React.useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            translations.locationPermissionDenied || 'Permissão negada',
            translations.locationPermissionMessage || 'Precisamos de permissão para acessar sua localização.'
          );
          setLoading(false);
          return;
        }

        // if lat/lng provided in params, center on them; otherwise use device location
        if (typeof latParam === 'number' && typeof lngParam === 'number') {
          setUserLocation({ latitude: latParam, longitude: lngParam });
          setRegion({ latitude: latParam, longitude: lngParam, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        } else {
          const loc = await Location.getCurrentPositionAsync({});
          if (!mounted) return;
          setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        }
        setLoading(false);

        // watch position for real-time updates
        locationSubscription.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
          (update) => {
            setUserLocation({ latitude: update.coords.latitude, longitude: update.coords.longitude });
          }
        );
      } catch (e) {
        console.warn('Localização não disponível', e);
        setLoading(false);
      }
    };

    start();

    return () => {
      mounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [translations]);

  const goToUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({ latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
    } else {
      Alert.alert(translations.locationError || 'Não foi possível obter sua localização.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={async () => {
          try {
            if (fromParam) {
              await (router as any).replace(fromParam);
            } else if ((router as any).back) {
              (router as any).back();
            }
          } catch (e) {
            console.warn('Erro ao voltar:', e);
            if (fromParam) await (router as any).replace(fromParam);
          }
        }} style={styles.backButton}>
          <Text style={{ color: colors.primary }}>{translations.back || 'Voltar'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>{translations.location || 'Localização'}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted, marginTop: 8 }}>{translations.loading || 'Carregando mapa...'}</Text>
        </View>
      ) : (
        <MapView
          ref={(r: any) => (mapRef.current = r)}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {ecopontos.map((p) => (
            <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }} title={p.title} />
          ))}

          {userLocation && (
            <Marker coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }} title={translations.you || 'Você'} pinColor="blue" />
          )}
        </MapView>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={goToUser}>
          <Text style={{ color: '#fff' }}>{translations.myLocation || 'Minha localização'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 80, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 12, paddingTop: Platform.OS === 'ios' ? 40 : 20 },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actions: { position: 'absolute', right: 12, bottom: 24 },
  fab: { padding: 12, borderRadius: 8, elevation: 3 },
});
