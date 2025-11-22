import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../styles/colors';
import { WalletLogo } from '../components/WalletLogo';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <WalletLogo width={80} height={80} />
        </View>
        <Text style={styles.appName}></Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Carteira Digital</Text>
        <Text style={styles.subtitle}>
          Gestão completa das finanças pessoais/familiares
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupButtonText}>Criar Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 95,
  },
  subtitle: {
    fontSize: 14,
    color: colors.lightText,
    lineHeight: 24,
    marginHorizontal: 50,
  },
  buttonsContainer: {
    marginBottom: 40,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: colors.secondary,
  },
  signupButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
});
