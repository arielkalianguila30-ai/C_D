import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function SelectLocation() {
  const router = useRouter();
  const [region, setRegion] = useState(() => ({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }));
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [following, setFollowing] = useState(false);
  const watchRef = useRef<any>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    // try to center on current location initially
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        setRegion(r => ({ ...r, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      // cleanup any active watch when unmounting
      if (watchRef.current) {
        try {
          watchRef.current.remove();
        } catch (e) {
          // ignore
        }
        watchRef.current = null;
      }
    };
  }, []);

  const setMyLocation = async () => {
    // Toggle following mode: if already following, stop; otherwise start watching
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para obter sua localização.');
        return;
      }

      if (following) {
        // stop watching
        if (watchRef.current) {
          watchRef.current.remove();
          watchRef.current = null;
        }
        setFollowing(false);
        return;
      }

      setLoadingLocation(true);
      // start watching position and update marker/region in (near) real-time
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, timeInterval: 1000, distanceInterval: 1 },
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMarker({ latitude: lat, longitude: lng });
          setRegion(r => ({ ...r, latitude: lat, longitude: lng }));
          try {
            if (mapRef.current && (mapRef.current as any).animateToRegion) {
              (mapRef.current as any).animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 300);
            }
          } catch (err) {
            // ignore animation errors
          }
        }
      );
      watchRef.current = subscription;
      setFollowing(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const onSave = async () => {
    if (!marker) return Alert.alert('Defina um local', 'Toque no mapa para posicionar o marcador ou use "Definir minha localização".');
    try {
      const placemarks = await Location.reverseGeocodeAsync({ latitude: marker.latitude, longitude: marker.longitude });
      const place = placemarks && placemarks.length > 0 ? placemarks[0] : null;
      const address = place ? [place.name, place.street, place.city, place.region, place.postalCode, place.country].filter(Boolean).join(', ') : '';
      // navigate back to CadastroEmpreendimento with selected coords
      router.push(`/CadastroEmpreendimento?highlightLat=${marker.latitude}&highlightLng=${marker.longitude}&address=${encodeURIComponent(address)}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível obter o endereço.');
    }
  };

  return (
    <View style={styles.container}>
      {/* top-left small back icon */}
      <TouchableOpacity style={styles.topLeftBack} onPress={() => router.push('/CadastroEmpreendimento')}>
        <Feather name="arrow-left" size={18} color="#fff" />
      </TouchableOpacity>

      {/* top-right compact back button (reduced) */}
      <TouchableOpacity style={styles.topRightBack} onPress={() => router.push('/CadastroEmpreendimento')}>
        <Feather name="x" size={16} color="#fff" />
      </TouchableOpacity>

      <MapView
        ref={(r) => { mapRef.current = r as MapView | null; }}
        style={styles.map}
        region={region}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setMarker({ latitude, longitude });
        }}
        onRegionChangeComplete={(r) => setRegion(r)}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={setMyLocation} disabled={loadingLocation}>
          {loadingLocation ? (
            <ActivityIndicator color="#fff" />
          ) : following ? (
            <><Feather name="pause" size={18} color="#fff" /><Text style={styles.controlText}>Parar</Text></>
          ) : (
            <><Feather name="crosshair" size={18} color="#fff" /><Text style={styles.controlText}>Definir minha localização</Text></>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#2fd24a' }]} onPress={onSave}>
          <Feather name="check" size={20} color="#fff" />
          <Text style={styles.controlText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  controls: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'column', gap: 8 },
  controlBtn: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  controlText: { color: '#fff', marginLeft: 8 },
  topLeftBack: { position: 'absolute', top: 40, left: 12, zIndex: 5, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  topRightBack: { position: 'absolute', top: 40, right: 12, zIndex: 5, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
});
