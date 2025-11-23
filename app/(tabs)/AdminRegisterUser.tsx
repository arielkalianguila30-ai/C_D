import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useLanguage } from "../context/LanguageContext";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../src/firebase/config";
import { useUserProfile } from "../context/UserProfileContext";
import { useAdmin } from "../context/AdminContext";
import { useTheme } from "../context/ThemeContext";

export default function AdminRegisterUser() {
  const { translations } = useLanguage();
  const { colors } = useTheme();
  const { addUser } = useAdmin();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não correspondem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      
      // Cria o usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualiza o nome de exibição
      await updateProfile(user, { displayName: name });

      // Adiciona o utilizador ao contexto admin
      addUser({
        id: user.uid,
        email: email,
        nome: name,
        isOnline: true,
        lastLogin: new Date().toISOString(),
      });

      Alert.alert(
        'Sucesso',
        'Utilizador registado com sucesso em tempo real',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao registar:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erro', 'Este email já está registado');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Erro', 'Email inválido');
      } else {
        Alert.alert('Erro', error.message || 'Não foi possível registar o utilizador');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Registar Novo Utilizador</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>Criar Conta</Text>

            {/* Nome */}
            <View style={styles.inputContainer}>
              <Feather name="user" size={18} color={colors.primary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nome Completo"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color={colors.primary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {/* Senha */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color={colors.primary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Senha"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color={colors.primary} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirmar Senha"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Feather
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Botão Registar */}
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Registando...' : 'Registar Utilizador'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  icon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  registerButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
