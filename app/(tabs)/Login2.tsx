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
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../context/AdminContext";
import { auth } from "../../src/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen() {
  const { translations } = useLanguage();
  const { saveCredentials } = useAuth();
  const { setIsAdmin } = useAdmin();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(translations.error, translations.fillAllFields, [{ text: "OK" }]);
      return;
    }

    try {
      // 🔥 Login com Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Verificar se é admin
      const isAdminUser = email === 'admistrador@gmail.com' && password === 'admin1';
      if (isAdminUser) {
        setIsAdmin(true);
        Alert.alert("Acesso Admin", "Bem-vindo Administrador!", [{ text: "OK", onPress: () => router.replace("/inicial") }]);
      } else {
        setIsAdmin(false);
        // Salva as credenciais se o usuário marcou "Lembrar-me"
        if (rememberMe) {
          await saveCredentials(email, password);
        }

        Alert.alert(
          translations.loginSuccess,
          translations.welcomeBack,
          [
            {
              text: "OK",
              onPress: () => router.replace("/inicial"),
            },
          ]
        );
      }
      console.log("✅ Usuário logado:", user.displayName || user.email);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      let mensagemErro = "";

      switch (err.code) {
        case "auth/user-not-found":
          mensagemErro = "Usuário não encontrado.";
          break;
        case "auth/wrong-password":
          mensagemErro = "Senha incorreta.";
          break;
        case "auth/invalid-email":
          mensagemErro = "E-mail inválido.";
          break;
        default:
          mensagemErro = "Erro ao fazer login. Tente novamente.";
      }

      Alert.alert("Erro de Login", mensagemErro, [{ text: "OK" }]);
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
              <Text style={styles.pillText}>{translations.hasAccount}</Text>

              {/* Campo de e-mail */}
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

              {/* Campo de senha */}
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

              {/* Opção Lembrar-me */}
              <TouchableOpacity 
                style={styles.rememberContainer} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Feather name="check" size={16} color="#fff" />}
                </View>
                <Text style={styles.rememberText}>Lembrar-me</Text>
              </TouchableOpacity>

              {/* Botão de login */}
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>{translations.login}</Text>
              </TouchableOpacity>

              {/* Link para cadastro */}
              <TouchableOpacity onPress={() => router.push("/Register2")}>
                <Text style={styles.linkText}>
                  {translations.noAccount} {"\n"}
                  <Text style={styles.Cad}>{translations.register}</Text>
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
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2fd24a',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2fd24a',
  },
  rememberText: {
    color: '#666',
    fontSize: 14,
  },
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
    fontSize: 20,
    textAlign: "center",
    marginBottom: 35,
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
  linkText: { textAlign: "left", marginTop: 12, color: "#e93124ff", fontWeight: "600", marginBottom: 20 },
  Cad: { color: "#2fd24a", fontWeight: "bold" },
  footerSmallText: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: "#efefef",
    width: "100%",
  },
});
