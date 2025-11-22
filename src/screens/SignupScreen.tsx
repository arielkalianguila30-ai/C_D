import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletLogo } from '../components/WalletLogo';

interface SignupScreenProps {
  navigation: any;
  route?: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'personal' | 'family'>('personal');

  // If route param preselectType is passed, pre-select the type and hide the other option
  React.useEffect(() => {
    const p = (route && route.params) || {};
    if (p.preselectType === 'family') setAccountType('family');
    if (p.preselectType === 'personal') setAccountType('personal');
  }, [route]);

  const handleSignup = () => {
    if (name && email && password && confirmPassword && password === confirmPassword) {
      (async () => {
        try {
          const stored = await AsyncStorage.getItem('@account_types');
          const arr = stored ? JSON.parse(stored) : [];
          if (!arr.includes(accountType)) arr.push(accountType);
          await AsyncStorage.setItem('@account_types', JSON.stringify(arr));
        } catch (err) {
          console.error('Erro ao salvar account types', err);
        }
        navigation.replace('AddCard');
      })();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.logo}>
            <WalletLogo width={80} height={80} />
          </View>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se a Namitech agora  </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.lightText}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Conta</Text>
            {route && route.params && route.params.preselectType ? (
              <View style={styles.fixedTypeWrap}>
                <Text style={styles.fixedTypeText}>{route.params.preselectType === 'family' ? 'Familiar' : 'Pessoal'}</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  style={[styles.accountTypeButton, accountType === 'personal' && styles.accountTypeActive]}
                  onPress={() => setAccountType('personal')}
                >
                  <Text style={[styles.accountTypeText, accountType === 'personal' && styles.accountTypeTextActive]}>Pessoal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.accountTypeButton, accountType === 'family' && styles.accountTypeActive]}
                  onPress={() => setAccountType('family')}
                >
                  <Text style={[styles.accountTypeText, accountType === 'family' && styles.accountTypeTextActive]}>Familiar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor={colors.lightText}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.lightText}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.lightText}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.buttonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.lightText,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkBlue,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.darkText,
    backgroundColor: colors.background,
  },
  signupButton: {
    height: 50,
    backgroundColor: colors.secondary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: colors.lightText,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
  accountTypeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  accountTypeActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  accountTypeText: {
    color: colors.darkBlue,
    fontWeight: '700',
  },
  accountTypeTextActive: {
    color: colors.white,
  },
  fixedTypeWrap: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  fixedTypeText: {
    fontSize: 16,
    color: colors.darkBlue,
    fontWeight: '700',
  },
});
