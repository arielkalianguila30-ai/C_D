
import { StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";

export default function TelaBoasVindas() {
  const navigation = useNavigation();
  const router = useRouter();
  const [contador, setContador] = useState(5);
  const mounted = React.useRef(true);

  useEffect(() => {
    const timer = setInterval(() => {
      if (mounted.current) {
        setContador((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimeout(() => {
              if (mounted.current) {
                router.replace('/menu');
              }
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/BB.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.bemVindo}>𝒮ℯ𝒿𝒶 𝒷ℯ𝓂-𝓋𝒾𝓃𝒹ℴ 𝒶ℴ</Text>
        <Text style={styles.logo}>
          <Text style={{ color: '#fff' }}>|𝔼ℂ𝕆</Text>
          <Text style={{ color: '#fff', fontSize: 50 }}>ℙ𝕆ℕ𝕋𝕆</Text>
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.timerText}>Entrando em {contador} segundos...</Text>
        <TouchableOpacity
          style={styles.botaoIniciar}
          onPress={() => router.push('/menu')}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotao}>Iniciar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timerText: {
    color: '#2fd24a',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  bemVindo: {
    fontSize: 24,
    color: '#5285F3',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'serif',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5285F3',
    textAlign: 'center',
  },
  footerImage: {
    position: 'absolute',
    bottom: 57,
    width: 390,
    height: 104,
    borderRadius: 10,
  },
  botaoIniciar: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#16d566ff',
    borderRadius: 25,
    width: 160,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 115,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});





