import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Alert, Modal, Platform, StatusBar, BackHandler, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCompanies } from '../context/CompaniesContext';
import { useTheme } from '../context/ThemeContext';
import { useBottomNav } from '../context/BottomNavContext';

const { width, height } = Dimensions.get('window');

const empresas = [
  { id: '1', nome: 'Empresa A', categoria: 'Loja', provincia: 'Luanda', latitude: -8.839, longitude: 13.289 },
  { id: '2', nome: 'Empresa B', categoria: 'Restaurante', provincia: 'Benguela', latitude: -12.576, longitude: 13.406 },
  { id: '3', nome: 'Empresa C', categoria: 'Oficina', provincia: 'Huíla', latitude: -14.916, longitude: 13.504 },
  { id: '4', nome: 'Empresa D', categoria: 'Supermercado', provincia: 'Cuando Cubango', latitude: -15.094, longitude: 18.669 },
];

export default function MapScreen() {
  const [routeDest, setRouteDest] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [etaText, setEtaText] = useState<string | null>(null);
  const [showCompanies, setShowCompanies] = useState<boolean>(false);
  const router = useRouter();
  const { colors } = useTheme();
  const [region, setRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [searchText, setSearchText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categorias: new Set<string>(),
    distancia: 10, // km
    avaliacao: 0,
  });
  const mapRef = useRef<MapView | null>(null);
  const { companies } = useCompanies();
  const [following, setFollowing] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const { setVisible } = useBottomNav();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; heading?: number } | null>(null);
  const [showUserLocation, setShowUserLocation] = useState<boolean>(true);
  const [empresasFiltradas, setEmpresasFiltradas] = useState<typeof empresas>([]);
  const [localizacao, setLocalizacao] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const provsFoco = ['Luanda', 'Benguela', 'Huíla'];

  const params: any = useLocalSearchParams();
  // parse params to stable primitive values to avoid effect re-running due to new object refs
  const highlightLat = params?.highlightLat ? parseFloat(params.highlightLat as string) : undefined;
  const highlightLng = params?.highlightLng ? parseFloat(params.highlightLng as string) : undefined;
  const centerOnUser = params?.centerOnUser === 'true' || params?.centerOnUser === true;
  const routeFlag = params?.route === 'true' || params?.route === true;
  const destLat = params?.destinationLat ? parseFloat(params.destinationLat as string) : undefined;
  const destLng = params?.destinationLng ? parseFloat(params.destinationLng as string) : undefined;

  // Filtra empresas por províncias de foco e obtem localização em tempo real
  useEffect(() => {
    const filtradas = empresas.filter(e => provsFoco.includes(e.provincia));
    setEmpresasFiltradas(filtradas);

    // Pede permissão para usar localização
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização para mostrar o mapa corretamente.');
        setIsLoadingLocation(false);
        return;
      }

      try {
        // Obter localização inicial
        const position = await Location.getCurrentPositionAsync({});
        setLocalizacao({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoadingLocation(false);

        // Obter localização atual em tempo real
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocalizacao(newLocation);
            setUserLocation(newLocation);

            // Ajusta mapa para mostrar empresas + você
            if (mapRef.current && filtradas.length > 0) {
              try {
                (mapRef.current as any).fitToCoordinates(
                  [
                    ...filtradas.map(e => ({ latitude: e.latitude, longitude: e.longitude })),
                    newLocation
                  ],
                  {
                    edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                    animated: true,
                  }
                );
              } catch (e) {
                // ignore animation errors
              }
            }
          }
        );
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível obter sua localização.');
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  // Hide bottom navigation while on map
  useEffect(() => {
    setVisible(false);
    return () => setVisible(true);
  }, []);

  // Android hardware back button: restore bottom nav and allow default back behavior
  useEffect(() => {
    const onBackPress = () => {
      setVisible(true);
      // return false so default back action still happens (navigation will pop)
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  // Check for highlight params (center map on new company)

  useEffect(() => {
    if (typeof highlightLat === 'number' && typeof highlightLng === 'number' && mapRef.current) {
      const newRegion = {
        latitude: highlightLat,
        longitude: highlightLng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      // avoid setting state if region already matches (prevents update loops)
      if (Math.abs((region.latitude || 0) - newRegion.latitude) > 0.000001 || Math.abs((region.longitude || 0) - newRegion.longitude) > 0.000001) {
        try {
          (mapRef.current as any).animateToRegion(newRegion, 500);
        } catch (e) {
          // ignore animation errors
        }
        setRegion(newRegion);
      }
    }
    // only depend on the primitive lat/lng values
  }, [highlightLat, highlightLng]);

  // Helper: haversine distance (km)
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle route request from CompanyDetails: create straight polyline + ETA fallback
  useEffect(() => {
    if (routeFlag && typeof destLat === 'number' && typeof destLng === 'number' && userLocation) {
      const dest = { latitude: destLat, longitude: destLng };
      setRouteDest(dest);
      const coords = [
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: dest.latitude, longitude: dest.longitude },
      ];
      setRouteCoords(coords);
      // compute ETA using simple assumption (50 km/h)
      const distKm = haversine(userLocation.latitude, userLocation.longitude, dest.latitude, dest.longitude);
      const speedKmh = 50; // fallback assumed speed
      const minutes = Math.max(1, Math.round((distKm / speedKmh) * 60));
      setEtaText(`${minutes} min (~${Math.round(distKm * 1000)} m)`);
      // focus map to show both points
      try {
        if (mapRef.current && coords.length > 1) {
          (mapRef.current as any).fitToCoordinates(coords, { edgePadding: { top: 120, right: 60, bottom: 160, left: 60 }, animated: true });
        }
      } catch (e) {
        // ignore
      }
      // While routing, prefer to hide unrelated company markers for clarity
      setShowCompanies(false);
    }
  }, [routeFlag, destLat, destLng, userLocation]);

  // If following and routing, update the origin portion of the route when userLocation changes
  useEffect(() => {
    if (routeDest && userLocation) {
      const coords = [
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: routeDest.latitude, longitude: routeDest.longitude },
      ];
      setRouteCoords(coords);
      const distKm = haversine(userLocation.latitude, userLocation.longitude, routeDest.latitude, routeDest.longitude);
      const speedKmh = 50;
      const minutes = Math.max(1, Math.round((distKm / speedKmh) * 60));
      setEtaText(`${minutes} min (~${Math.round(distKm * 1000)} m)`);
    }
  }, [userLocation]);

  const startFollowing = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua localização.');
      return;
    }

    if (following) {
      if (watchRef.current) {
        watchRef.current.remove();
      }
      setFollowing(false);
      setShowUserLocation(false);
      return;
    }

    const subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 1000, distanceInterval: 10 },
      (location) => {
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        if (mapRef.current) {
          (mapRef.current as any).animateToRegion(newRegion, 300);
        }
  setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude, heading: typeof location.coords.heading === 'number' ? location.coords.heading : undefined });
      }
    );
    watchRef.current = subscription;
    setFollowing(true);
    setShowUserLocation(true);
  };

  // Função para calcular distância entre dois pontos (Haversine)
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filtrar empresas por busca, categoria e distância
  const empresasFiltroAplicado = empresasFiltradas.filter(empresa => {
    // Filtro de busca por nome ou categoria
    const matchesSearch = searchText === '' || 
      empresa.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      empresa.categoria.toLowerCase().includes(searchText.toLowerCase()) ||
      empresa.provincia.toLowerCase().includes(searchText.toLowerCase());
    
    // Filtro de categoria
    const matchesCategory = selectedFilters.categorias.size === 0 || 
      selectedFilters.categorias.has(empresa.categoria);
    
    // Filtro de distância
    let matchesDistance = true;
    if (localizacao && userLocation) {
      const distancia = calcularDistancia(
        userLocation.latitude,
        userLocation.longitude,
        empresa.latitude,
        empresa.longitude
      );
      matchesDistance = distancia <= selectedFilters.distancia;
    }
    
    return matchesSearch && matchesCategory && matchesDistance;
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.nome.toLowerCase().includes(searchText.toLowerCase()) ||
                         company.descricao.toLowerCase().includes(searchText.toLowerCase()) ||
                         (company.servicos?.some(s => s.toLowerCase().includes(searchText.toLowerCase())) ?? false);
    
    const matchesCategory = selectedFilters.categorias.size === 0 || 
                          (company.servicos?.some(s => selectedFilters.categorias.has(s)) ?? false);
    
    // Calculate distance if we have user location and company coordinates
    const matchesDistance = true; // You can implement distance calculation here
    
    return matchesSearch && matchesCategory && matchesDistance;
  });

  return (
    <View style={styles.container}>
      {/* Loading screen while getting location */}
      {isLoadingLocation && (empresasFiltradas.length === 0 || !localizacao) && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2fd24a" />
        </View>
      )}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => { setVisible(true); (router as any).push('/inicial'); }}
      >
        <Feather name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Search and filter bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar empresas próximas..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterOpen(true)}
        >
          <Feather name="sliders" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={showUserLocation}
        followsUserLocation={following}
        initialRegion={localizacao ? {
          latitude: localizacao.latitude,
          longitude: localizacao.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        } : region}
        onRegionChangeComplete={setRegion}
      >
        {/* Marcadores de empresas filtradas */}
        {empresasFiltroAplicado.map(e => (
          <Marker
            key={e.id}
            coordinate={{ latitude: e.latitude, longitude: e.longitude }}
            title={e.nome}
            description={e.categoria}
          >
            <Callout onPress={() => { setVisible(true); (router as any).push(`/CompanyDetails?id=${e.id}`); }}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{e.nome}</Text>
                <Text style={styles.calloutSubtitle}>{e.categoria}</Text>
                <Text style={styles.calloutAddress}>{e.provincia}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ETA overlay when routing */}
      {etaText && (
        <View style={{ position: 'absolute', bottom: 100, right: 20, backgroundColor: '#fff', padding: 8, borderRadius: 8, elevation: 4 }}>
          <Text style={{ fontWeight: '700' }}>Estimativa: {etaText}</Text>
        </View>
      )}

      {/* Current location button */}
      <TouchableOpacity 
        style={[styles.locationButton, following && styles.locationButtonActive]}
        onPress={startFollowing}
      >
        <Feather 
          name={following ? "pause" : "crosshair"} 
          size={24} 
          color={following ? "#2fd24a" : "#666"} 
        />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={isFilterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setIsFilterOpen(false)}>
                <Feather name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Categoria</Text>
            <View style={styles.filterOptions}>
              {['Loja', 'Restaurante', 'Oficina', 'Supermercado', 'Café', 'Coworking'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterOption,
                    selectedFilters.categorias.has(cat) && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    const newCategories = new Set(selectedFilters.categorias);
                    if (newCategories.has(cat)) {
                      newCategories.delete(cat);
                    } else {
                      newCategories.add(cat);
                    }
                    setSelectedFilters({...selectedFilters, categorias: newCategories});
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilters.categorias.has(cat) && styles.filterOptionTextSelected
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Distância Máxima: {selectedFilters.distancia} km</Text>
            <View style={styles.distanceSlider}>
              <TouchableOpacity 
                style={styles.distanceButton}
                onPress={() => setSelectedFilters({...selectedFilters, distancia: Math.max(1, selectedFilters.distancia - 5)})}
              >
                <Text style={styles.distanceButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.distanceValue}>{selectedFilters.distancia} km</Text>
              <TouchableOpacity 
                style={styles.distanceButton}
                onPress={() => setSelectedFilters({...selectedFilters, distancia: selectedFilters.distancia + 5})}
              >
                <Text style={styles.distanceButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setIsFilterOpen(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros ({empresasFiltroAplicado.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedFilters({ categorias: new Set(), distancia: 10, avaliacao: 0 });
                setSearchText('');
              }}
            >
              <Text style={styles.clearButtonText}>Limpar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  {/* BottomNavigation intentionally hidden on this screen (controlled by BottomNavContext) */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 70,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButtonActive: {
    backgroundColor: '#e6ffe6',
    borderWidth: 2,
    borderColor: '#2fd24a',
  },
  callout: {
    padding: 15,
    maxWidth: 250,
    borderRadius: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  calloutSubtitle: {
    fontSize: 14,
    color: '#2fd24a',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  calloutHours: {
    fontSize: 14,
    color: '#2fd24a',
    marginBottom: 4,
  },
  calloutPhone: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterOptionSelected: {
    backgroundColor: '#2fd24a',
  },
  filterOptionText: {
    color: '#666',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  applyButton: {
    backgroundColor: '#2fd24a',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  distanceSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  distanceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2fd24a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});