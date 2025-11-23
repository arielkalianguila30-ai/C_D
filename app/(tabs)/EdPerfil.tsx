import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUserProfile } from '../context/UserProfileContext';
import { useTheme } from '../context/ThemeContext';
import { auth, storage } from '../../src/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile as fbUpdateProfile, updateEmail as fbUpdateEmail, updatePassword as fbUpdatePassword } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function EdPerfil() {
  const { profile, setName, setPhoto, setProfile } = useUserProfile();
  // keep translations for labels, but do NOT offer language selection here anymore
  const { translations } = useLanguage();
  const { saveCredentials } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = React.useState(profile.email || '');
  const [numero, setNumero] = React.useState(profile.numero || '');
  const [senha, setSenha] = React.useState('');
  const [uploading, setUploading] = React.useState(false);

  // keep local states in sync when profile changes (for fields we don't update in real-time)
  React.useEffect(() => {
    setEmail(profile.email || '');
    setNumero(profile.numero || '');
    // do not populate password from profile (we don't store raw passwords)
    setSenha('');
  }, [profile]);

  const pickImage = async () => {
    try {
      // require dynamically so projects without expo-image-picker don't fail TypeScript import resolution
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImagePicker = require('expo-image-picker');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'É preciso permitir o acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });

      // Handle both older and newer result shapes
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        
        // Set the local URI immediately for instant preview
        setPhoto(localUri);

        // Upload to Firebase Storage and set profile photo to download URL
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Erro', 'Usuário não autenticado');
          return;
        }

        // show uploading indicator
        setUploading(true);
        try {
          const response = await fetch(localUri);
          const blob = await response.blob();
          
          // Use a consistent filename for each user's profile picture
          const fileName = `profile_${user.uid}.jpg`;
          const filePath = `profile_pictures/${fileName}`;
          const storageRef = ref(storage, filePath);
          
          await uploadBytes(storageRef, blob);
          const downloadUrl = await getDownloadURL(storageRef);

          // Update profile and auth
          await setPhoto(downloadUrl);
          await fbUpdateProfile(user, { photoURL: downloadUrl });
        } catch (err) {
          console.error('Upload error', err);
          Alert.alert('Erro', 'Não foi possível enviar a imagem. Tente novamente.');
        } finally {
          setUploading(false);
        }
      }
    } catch (e) {
      console.error('Error picking image', e);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleSave = async () => {
    try {
  // persist remaining non-sensitive fields
  await setProfile({ email, numero });

      // Try to update Firebase Auth profile where possible so changes propagate app-wide
      try {
        const user = auth.currentUser;
        if (user) {
          // update display name
          if ((profile.nome || '') !== (user.displayName || '')) {
            await fbUpdateProfile(user, { displayName: profile.nome || undefined });
          }

          // update photo if changed
          if (profile.photoUri && profile.photoUri !== user.photoURL) {
            await fbUpdateProfile(user, { photoURL: profile.photoUri });
          }

          // update email if it changed
          if (email && email !== user.email) {
            try {
              await fbUpdateEmail(user, email);
            } catch (e) {
              // updating email may require recent login
              console.warn('Could not update Firebase auth email:', e);
              Alert.alert('Aviso', 'Não foi possível atualizar o email no provedor de autenticação. Você pode precisar reentrar para confirmar essa alteração.');
            }
          }

          // update password if provided (may require recent auth)
          if (senha) {
            try {
              await fbUpdatePassword(user, senha);
              // update a non-sensitive marker so other screens can react
              await setProfile({ passwordChangedAt: new Date().toISOString() });
              // update saved credentials (if user chose to save them)
              try {
                await saveCredentials(email || user.email || '', senha);
              } catch (err) {
                // not critical; just log
                console.warn('Could not update saved credentials:', err);
              }
            } catch (e) {
              console.warn('Could not update Firebase password:', e);
              // don't block saving local profile; notify user
              Alert.alert('Aviso', 'Não foi possível atualizar a senha no provedor de autenticação. Você pode precisar reautenticar.');
            }
          }
        }
      } catch (e) {
        console.warn('Error syncing with Firebase Auth', e);
      }

      router.push('/Perfil');
    } catch (e) {
      Alert.alert(translations.error || 'Erro', translations.saveError || 'Não foi possível salvar as alterações.');
    }
  };

  return (
  <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={[styles.headerTop, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.push('/Perfil')}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{translations.editProfile}</Text>
      </View>

      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center' }}>
          <Image
            source={profile.photoUri ? { uri: profile.photoUri } : require('../../assets/images/transferir.png')}
            style={styles.profileImage}
          />
          {uploading ? (
            <ActivityIndicator style={{ marginTop: 8 }} color={colors.primary} />
          ) : (
            <Text style={styles.editButtonText}>{translations.changePicture}</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{translations.editProfile}</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{translations.name}</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.muted }]}
            placeholder={translations.enterName}
            placeholderTextColor={colors.muted}
            value={profile.nome || ''}
            onChangeText={(t) => setName(t)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{translations.email}</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.muted }]}
            placeholder={translations.enterEmail}
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{translations.phone}</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.muted }]}
            placeholder={translations.enterPhone}
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            value={numero}
            onChangeText={setNumero}
          />
        </View>

        {/* Language selection moved to Configurações - removed from Edit Profile */}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{translations.password}</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.muted }]}
            placeholder={translations.enterPassword}
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{translations.saveChanges}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* language selector removed from this screen */
  editButtonText: {
    color: '#2196F3',
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#e9f7ecff',
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee',
    marginTop: 110,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});