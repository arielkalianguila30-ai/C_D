import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, ImageBackground, Dimensions, Platform, StatusBar, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useBottomNav } from '../context/BottomNavContext';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../src/firebase/config';
import { Feather } from '@expo/vector-icons';

export default function CadastroEmpreendimento() {
  const router = useRouter();
  const { setActive } = useBottomNav();
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [contato, setContato] = useState('');
  const [descricao, setDescricao] = useState('');
  const [horario, setHorario] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso às fotos para escolher o logo');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    // Newer expo-image-picker returns { canceled: boolean, assets: [{ uri }] }
    if (!result.canceled && (result as any).assets && (result as any).assets.length > 0) {
      setImageUri((result as any).assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para tirar a foto');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && (result as any).assets && (result as any).assets.length > 0) {
      setImageUri((result as any).assets[0].uri);
    }
  };

  // When user clicks the address field we open the map selector.
  const params = useLocalSearchParams();

  useEffect(() => {
    // If SelectLocation returned a chosen location, apply it here
    try {
      const lat = params.highlightLat as string | undefined;
      const lng = params.highlightLng as string | undefined;
      const addr = params.address as string | undefined;
      if (lat && lng) {
        const latn = parseFloat(lat);
        const lngn = parseFloat(lng);
        setLatitude(latn);
        setLongitude(lngn);
        if (addr) setEndereco(decodeURIComponent(addr));
        // clear search params by replacing route without params
        router.replace('/CadastroEmpreendimento');
      }
    } catch (e) {
      // ignore malformed params
    }
  }, [params]);

  const uploadImageAsync = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSave = async () => {
    if (!nome.trim()) return Alert.alert('Validação', 'Preencha o nome do negócio');
    setLoading(true);
    try {
      let imageUrl = null;
      if (imageUri) {
        const fileName = `businesses/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
        imageUrl = await uploadImageAsync(imageUri, fileName);
      }

      const doc = {
        nome: nome.trim(),
        categoria: categoria.trim() || null,
        endereco: endereco || null,
        latitude: latitude || null,
        longitude: longitude || null,
        contato: contato || null,
        descricao: descricao || null,
        horario: horario || null,
        imagem: imageUrl || null,
        createdAt: serverTimestamp(),
      };

  const added = await addDoc(collection(db, 'businesses'), doc);
  Alert.alert('Sucesso', 'Empreendimento cadastrado com sucesso');
  // After saving, take user to initial screen and highlight the new business location
  const latParam = latitude != null ? latitude : '';
  const lngParam = longitude != null ? longitude : '';
  setActive('inicial');
  router.push(`/inicial?highlightName=${encodeURIComponent(nome.trim())}&highlightLat=${latParam}&highlightLng=${lngParam}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('../../assets/images/Fundo.jpg')} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay} />

        <TouchableOpacity style={styles.backButton} onPress={() => { setActive('perfil'); router.push('/Perfil'); }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.topLogoArea}>
              <Text style={styles.logoText}>
                <Text style={{ color: '#5285F3' }}>|𝔼ℂ𝕆</Text>
                <Text style={{ color: '#5285F3', fontSize: 50 }}>ℙ𝕆ℕ𝕋𝕆</Text>
              </Text>
            </View>

            <View style={styles.whiteCard}>
              <Text style={styles.pillText}>Cadastrar Empreendimento</Text>

              <View style={styles.inputContainer}>
                <Feather name="briefcase" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput placeholder="Nome do negócio" style={styles.inputWithIcon} placeholderTextColor="#7a7a7a" value={nome} onChangeText={setNome} />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="tag" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput placeholder="Categoria" style={styles.inputWithIcon} placeholderTextColor="#7a7a7a" value={categoria} onChangeText={setCategoria} />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="map-pin" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput placeholder="Endereço (GPS automático)" style={styles.inputWithIcon} placeholderTextColor="#7a7a7a" value={endereco} onChangeText={setEndereco} />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => router.push('/SelectLocation')}>
                  <Feather name="map-pin" size={20} color="#7a7a7a" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Feather name="image" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <Text style={[styles.inputWithIcon, { paddingTop: 10 }]}>Foto / Logotipo</Text>
              </View>

              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.preview} />
              ) : (
                <View style={styles.previewPlaceholder}><Text style={{ color: '#999' }}>Nenhuma imagem</Text></View>
              )}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#efefef', width: '45%' }]} onPress={pickImage}><Text style={[styles.primaryButtonText, { color: '#333' }]}>Escolher</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#efefef', width: '45%' }]} onPress={takePhoto}><Text style={[styles.primaryButtonText, { color: '#333' }]}>Tirar foto</Text></TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Feather name="phone" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput placeholder="Contato (WhatsApp / E-mail / Instagram)" style={styles.inputWithIcon} placeholderTextColor="#7a7a7a" value={contato} onChangeText={setContato} />
              </View>

              <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start' }]}>
                <Feather name="file-text" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput placeholder="Breve descrição" style={[styles.inputWithIcon, { height: 100 }]} placeholderTextColor="#7a7a7a" value={descricao} onChangeText={setDescricao} multiline />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="clock" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput placeholder="Horário de funcionamento" style={styles.inputWithIcon} placeholderTextColor="#7a7a7a" value={horario} onChangeText={setHorario} />
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Salvar</Text>}
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const windowHeight = Dimensions.get('window').height;
const topOffset = Platform.OS === 'android' ? ((StatusBar.currentHeight ?? 20) + 8) : 40;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#efefef', width: '100%', height: '100%' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(47, 210, 74, 0.45)' },
  backButton: {
    position: 'absolute',
    top: topOffset,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flexGrow: 1, justifyContent: 'space-between' },
  topLogoArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  logoText: { fontSize: 36, fontWeight: '700', textAlign: 'center' },
  whiteCard: {
    backgroundColor: '#efefef',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 70,
    marginTop: 100,
    minHeight: 440,
  },
  pillText: {
    color: '#2fd24a',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 35,
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 23,
    borderWidth: 1.6,
    borderColor: '#2fd24a',
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  inputWithIcon: { flex: 1, marginLeft: 8, height: '100%', color: '#000' },
  inputIcon: { marginRight: 4 },
  eyeIcon: { padding: 4 },
  primaryButton: {
    width: '40%',
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2fd24a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginHorizontal: 110,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  Cad: { color: '#2fd24a', fontWeight: 'bold' },
  footerSmallText: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: '#efefef',
    width: '100%',
  },
  preview: { width: '100%', height: 180, borderRadius: 8, marginVertical: 8 },
  previewPlaceholder: { width: '100%', height: 180, borderRadius: 8, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
});
