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
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLanguage } from "../context/LanguageContext";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../src/firebase/config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserProfile } from "../context/UserProfileContext";
import { useFavorites } from "../context/FavoritesContext";
import { useBottomNav } from "../context/BottomNavContext";
import { useSavedItems } from "../context/SavedItemsContext";
import { useWatchedCompanies } from "../context/WatchedCompaniesContext";

export default function RegisterScreen() {
  const { translations } = useLanguage();
  const { setProfile } = useUserProfile();
  const { clearFavorites } = useFavorites();
  const { setActive } = useBottomNav();
  const { clearSavedItems } = useSavedItems();
  const { clearWatchedCompanies } = useWatchedCompanies();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert(translations.error, translations.fillAllFields, [{ text: "OK" }]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(translations.passwordMismatch, translations.passwordMismatchMessage, [{ text: "OK" }]);
      return;
    }

    if (password.length < 6) {
      Alert.alert(translations.passwordTooShort, translations.passwordLengthMessage, [{ text: "OK" }]);
      return;
    }

    try {
      // 🔥 Cria o usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualiza o nome de exibição do usuário
      await updateProfile(user, { displayName: name });

      // Atualiza o perfil do usuário no Firebase
      try {
        await updateProfile(user, { displayName: name });
      } catch (error) {
        console.error("Erro ao atualizar o perfil:", error);
      }

      // Atualiza o perfil no contexto
      await setProfile({
        nome: name,
        email: email,
      });

      // Limpa todos os estados do app e AsyncStorage
      await Promise.all([
        clearFavorites(),
        clearSavedItems(),
        clearWatchedCompanies(),
        AsyncStorage.clear() // Clear all stored data to ensure fresh start
      ]);
      setActive('inicial');

      Alert.alert(
        translations.registerSuccess,
        translations.accountCreated,
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => {
                router.replace("/inicial");
              }, 100);
            },
          },
        ]
      );

      console.log("✅ Usuário criado:", user.email);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      let mensagemErro = "";

      switch (err.code) {
        case "auth/email-already-in-use":
          mensagemErro = "Este e-mail já está em uso.";
          break;
        case "auth/invalid-email":
          mensagemErro = "E-mail inválido.";
          break;
        case "auth/weak-password":
          mensagemErro = "A senha é muito fraca.";
          break;
        default:
          mensagemErro = "Erro ao criar conta. Tente novamente.";
      }

      Alert.alert("Erro de Cadastro", mensagemErro, [{ text: "OK" }]);
      console.error("❌ Erro Firebase:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/Fundo.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/menu")}>
          <AntDesign name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.topLogoArea}>
              <Text style={styles.logoText}>
                <Text style={{ color: "#5285F3" }}>|𝔼ℂ𝕆</Text>
                <Text style={{ color: "#5285F3", fontSize: 50 }}>ℙ𝕆ℕ𝕋𝕆</Text>
              </Text>
            </View>

            <View style={styles.whiteCard}>
              <Text style={styles.pillText}>{translations.createAccount}</Text>

              {/* Campo Nome */}
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput
                  placeholder={translations.enterName}
                  style={styles.inputWithIcon}
                  placeholderTextColor="#7a7a7a"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Campo Email */}
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput
                  placeholder={translations.enterEmail}
                  style={styles.inputWithIcon}
                  placeholderTextColor="#7a7a7a"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Campo Senha */}
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput
                  placeholder={translations.password}
                  secureTextEntry={!showPassword}
                  style={styles.inputWithIcon}
                  placeholderTextColor="#7a7a7a"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#7a7a7a" />
                </TouchableOpacity>
              </View>

              {/* Confirmar Senha */}
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#7a7a7a" style={styles.inputIcon} />
                <TextInput
                  placeholder={translations.confirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.inputWithIcon}
                  placeholderTextColor="#7a7a7a"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#7a7a7a" />
                </TouchableOpacity>
              </View>

              {/* Botão de Cadastro */}
              <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>{translations.register}</Text>
              </TouchableOpacity>

              {/* Link Login */}
              <TouchableOpacity onPress={() => router.push("/Login2")}>
                <Text style={styles.linkText}>
                  {translations.hasAccount} {"\n"}
                  <Text style={styles.Cad}>{translations.login}</Text>
                </Text>
              </TouchableOpacity>

              {/* Rodapé */}
              <View style={styles.footerSmallText}>
                <Text>Política de privacidade. Termos de serviço</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#efefef", width: "100%", height: "100%" },
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(47, 210, 74, 0.45)" },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { flexGrow: 1, justifyContent: "space-between" },
  topLogoArea: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  logoText: { fontSize: 36, fontWeight: "700", textAlign: "center" },
  whiteCard: {
    backgroundColor: "#efefef",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 70,
    marginTop: 100,
    minHeight: 440,
  },
  pillText: {
    color: "#2fd24a",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 35,
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: 23,
    borderWidth: 1.6,
    borderColor: "#2fd24a",
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  inputWithIcon: { flex: 1, marginLeft: 8, height: "100%", color: "#000" },
  inputIcon: { marginRight: 4 },
  eyeIcon: { padding: 4 },
  primaryButton: {
    width: "40%",
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2fd24a",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginHorizontal: 110,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 20 },
  linkText: { textAlign: "left", marginTop: 12, color: "#e93124ff", fontWeight: "600" },
  Cad: { color: "#2fd24a", fontWeight: "bold" },
  footerSmallText: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: "#efefef",
    width: "100%",
  },
});
