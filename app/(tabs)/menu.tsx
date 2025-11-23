import React from "react";
import { SafeAreaView, ImageBackground, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, BackHandler, Dimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Feather, FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function MenuPrincipal() {
  const router = useRouter();
  const [searchText, setSearchText] = React.useState('');
  
  const anuncios = [
    {
      id: 1,
      titulo: "Trocadero (Pastelaria / Pâtisserie)",
      endereco: "Avenida Lenine, Luanda",
      imagem: require('../../assets/images/1.png')
    },
    {
      id: 2,
      titulo: "Sukara (Pastelaria / Restaurante)",
      endereco: "Morro Bento, Município de Luanda, Luanda",
      imagem: require('../../assets/images/2.png')
    },
    {
      id: 3,
      titulo: "Sarah Café & Pastelaria",
      endereco: "Rua Aires de Menezes (Maianga), Luanda",
      imagem: require('../../assets/images/3.png')
    }
  ];

  const anunciosFiltrados = anuncios.filter(anuncio =>
    anuncio.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
    anuncio.endereco.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAnuncioPress = () => {
    Alert.alert(
      "Acesso Restrito",
      "Inicie sessão para mostrar a localização.",
      [
        { text: "Entrar", onPress: () => router.push("/Login2") },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/Fundo.jpg')}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={styles.overlay} pointerEvents="none" />

        <View style={styles.content}>
          {/* ↩️ Botão de Saída */}
          <TouchableOpacity 
            style={styles.exitButton}
            onPress={() => BackHandler.exitApp()}
          >
            <Feather name="log-out" size={24} color="#166534" />
          </TouchableOpacity>

          {/* 🔍 Barra de Pesquisa */}
          <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar anúncios..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 📰 Área de Anúncios */}
      <View style={{ flex: 1, marginBottom: 0 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} style={styles.anunciosContainer}>
          <Text style={styles.titulo}>Anúncios Recentes</Text>
          
          {anunciosFiltrados.length > 0 ? (
            anunciosFiltrados.map(anuncio => (
              <TouchableOpacity 
                key={anuncio.id} 
                style={styles.anuncioCard}
                onPress={handleAnuncioPress}
                activeOpacity={0.7}
              >
                <Image
                  source={anuncio.imagem}
                  style={styles.anuncioImagem}
                />
                <Text style={styles.anuncioTitulo}>{anuncio.titulo}</Text>
                <Text style={styles.anuncioTexto}>{anuncio.endereco}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.mensagemContainer}>
              <Text style={styles.mensagemNaoEncontrado}>
                Local não encontrado, inicie sessão para melhor resultado.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

        {/* 🔘 Botões Login e Cadastrar */}
        </View>
        <View style={styles.whiteCard}>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.botao1} 
            onPress={() => router.push("/Login2")}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotao}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.botao} 
            onPress={() => router.push("/Register2")}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotao}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.Sig}>Siga-nos</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="instagram" size={24} color="#E4405F" />
          </TouchableOpacity>
        </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efefef',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(47, 210, 74, 0.45)'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  botao1: {
   flex: 1,
    marginHorizontal: 10,
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#503fe7ff",
  },
  mensagemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  mensagemNaoEncontrado: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  Sig: {
    fontSize: 20,
    color: "#2fd24a",
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 4,
  },
  exitButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  anunciosContainer: {
    paddingVertical: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffffff",
    marginBottom: 10,
  },
  anuncioCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  anuncioImagem: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  anuncioTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2fd24a",
  },
  anuncioTexto: {
    fontSize: 14,
    color: "#444",
    marginTop: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  botao: {
    flex: 1,
    marginHorizontal: 10,
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2fd24a",
  },
  textoBotao: {
    color: "#ffffffff",
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  socialRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 12 
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  whiteCard: {
    backgroundColor: '#efefef',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
