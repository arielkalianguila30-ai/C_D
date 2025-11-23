import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../src/firebase/config';
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function EmailDetails() {
  const router = useRouter();
  const user = auth.currentUser;
  const { savedCredentials } = useAuth();
  const { profile } = useUserProfile();
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const { translations } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/Perfil')}>
        <AntDesign name="arrow-left" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={[styles.content, { backgroundColor: colors.background }]}> 
        <Text style={[styles.title, { color: colors.primary }]}>Detalhes da Conta</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.label, { color: colors.muted }]}>{translations.userEmail || 'Email'}:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{profile.email || user?.email}</Text>

          {profile.numero ? (
            <>
              <Text style={[styles.label, { color: colors.muted, marginTop: 12 }]}>{translations.phone || 'Número'}:</Text>
              <Text style={[styles.value, { color: colors.text }]}>{profile.numero}</Text>
            </>
          ) : null}
        </View>

        {savedCredentials && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Senha:</Text>
            <View style={styles.passwordContainer}>
              <Text style={styles.value}>
                {showPassword ? savedCredentials.password : '••••••••'}
              </Text>
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#2fd24a"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>
            {user?.emailVerified ? 'Verificado' : 'Não verificado'}
          </Text>
          {profile.passwordChangedAt && (
            <Text style={[styles.value, { marginTop: 8 }]}>
              {'Senha atualizada em: ' + new Date(profile.passwordChangedAt).toLocaleString()}
            </Text>
          )}
          {!user?.emailVerified && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={async () => {
                if (user) {
                  try {
                    await sendEmailVerification(user);
                    Alert.alert(
                      'Email enviado',
                      'Por favor, verifique sua caixa de entrada para confirmar seu email.'
                    );
                  } catch (error) {
                    Alert.alert(
                      'Erro',
                      'Não foi possível enviar o email de verificação. Tente novamente mais tarde.'
                    );
                  }
                }
              }}
            >
              <Text style={styles.verifyButtonText}>Verificar Email</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={async () => {
            if (user?.email || profile.email) {
              try {
                // Prefer the persisted profile email if provided, otherwise use auth user email
                const targetEmail = profile.email || user?.email;
                if (targetEmail) {
                  await sendPasswordResetEmail(auth, targetEmail);
                } else {
                  Alert.alert('Erro', 'Nenhum email disponível para enviar a redefinição.');
                }
                Alert.alert(
                  'Email enviado',
                  'Enviamos um link para redefinir sua senha no seu email.'
                );
              } catch (error) {
                Alert.alert(
                  'Erro',
                  'Não foi possível enviar o email de redefinição de senha. Tente novamente mais tarde.'
                );
              }
            }
          }}
        >
          <Text style={styles.changePasswordText}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyeButton: {
    padding: 8,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2fd24a',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#2fd24a',
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  changePasswordButton: {
    backgroundColor: '#2fd24a',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  changePasswordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});