import React, { JSX, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ImageSourcePropType, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useBottomNav } from '../context/BottomNavContext';
import useOpenLocation from '../components/useOpenLocation';
import BottomNavigation from '../components/BottomNavigation';
import { auth } from '../../src/firebase/config';
import { usePersistentAuth } from '../context/PersistentAuthContext';
import { useAdmin } from '../context/AdminContext';

// Tipagens para os ícones do Feather
type MenuIconName = 'eye' | 'bookmark' | 'share-2' | 'mail' | 'clock' | 'help-circle' | 'settings' | 'plus' | 'users' | 'briefcase';

// Interface para os itens do menu
interface MenuItem {
  label: string;
  icon: MenuIconName;
  route?: '/EmpresasObservadas' | '/ItensSalvos' | '/EmailDetails' | '/Configuracoes' | '/AdminUsers' | '/AdminCompanies' | '/CadastroEmpreendimento';
  action?: () => void;
}

// Tipagens opcionais para maior segurança
interface Profile {
  nome?: string;
  photoUri?: string;
}

interface Translations {
  editProfile: string;
  watchedCompanies: string;
  saved: string;
  send: string;
  email: string;
  recentlyViewed: string;
  supportService: string;
  settings: string;
  logout: string;
  home: string;
  location: string;
  locationMessage: string;
  search: string;
  favorites: string;
  profile: string;
}

export default function Perfil(): JSX.Element {
  const { favorites } = useFavorites();
  const { profile } = useUserProfile();
  const { translations } = useLanguage();
  const router = useRouter();
  const { signOut } = usePersistentAuth();
  const { colors } = useTheme();
  const { active, setActive } = useBottomNav();
  const { openLocation } = useOpenLocation();
  const { isAdmin } = useAdmin();

  const displayName = profile?.nome || profile?.email || '';
  const displayEmail = profile?.email || '';

  return (
  <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <Image
          source={
            profile?.photoUri
              ? { uri: profile.photoUri }
              : (require('../../assets/images/transferir.png') as ImageSourcePropType)
          }
          style={styles.profileImage}
        />

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/EdPerfil')}
        >
          <Text style={[styles.editButtonText, { color: colors.primary }]}> 
            {translations.editProfile || 'Editar perfil'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.username, { color: colors.text }]}>@{displayName.replace(/\s+/g, '_')}</Text>
      </View>

      {/* Itens de menu */}
      <View style={styles.menuContainer}>
        {isAdmin && (
          <>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/AdminUsers' as any)}
            >
              <View style={styles.menuItemLeft}>
                <Feather name="users" size={20} color="#ff6b6b" style={styles.menuIcon} />
                <Text style={[styles.menuText, { color: '#ff6b6b', fontWeight: '700' }]}>Gerenciar Utilizadores</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ff6b6b" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/AdminCompanies' as any)}
            >
              <View style={styles.menuItemLeft}>
                <Feather name="briefcase" size={20} color="#ff6b6b" style={styles.menuIcon} />
                <Text style={[styles.menuText, { color: '#ff6b6b', fontWeight: '700' }]}>Gerenciar Empresas</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </>
        )}
        {([
          {
            label: 'Registrar Negócio ',
            icon: 'plus' as MenuIconName,
            route: '/CadastroEmpreendimento' as const
          },
          {
            label: translations.watchedCompanies || 'Empresas assistidas',
            icon: 'eye' as MenuIconName,
            route: '/EmpresasObservadas' as const
          },
          {
            label: translations.saved || 'Salvos',
            icon: 'bookmark' as MenuIconName,
            route: '/ItensSalvos' as const
          },
          {
            label: translations.send || 'Compartilhar App',
            icon: 'share-2' as MenuIconName,
            action: () => {
              Alert.alert(
                translations.shareTitle || 'Compartilhar',
                translations.shareMessage || 'Compartilhe o EcoPonto com seus amigos',
                [
                  { text: translations.copyLink || 'Copiar Link', onPress: () => Alert.alert(translations.copyLink || 'Link copiado!') },
                  { text: translations.cancel || 'Cancelar', style: 'cancel' }
                ]
              );
            }
          },
          {
            label: (translations.userEmail || 'Email') + displayEmail,
            icon: 'mail' as MenuIconName,
            route: '/EmailDetails' as const
          },
          {
            label: translations.recentlyViewed || 'Histórico',
            icon: 'clock' as MenuIconName,
            action: () => {
              Alert.alert(translations.comingSoon || 'Em breve', translations.comingSoon || 'Em breve');
            } 
          },
          {
            label: translations.supportService || 'Suporte',
            icon: 'help-circle' as MenuIconName,
            action: () => {
              Alert.alert(
                translations.supportTitle || 'Suporte',
                translations.supportMessage || 'Como podemos ajudar?',
                [
                  { text: translations.faq || 'FAQ', onPress: () => Alert.alert(translations.comingSoon || 'Em breve', translations.comingSoon || 'Em breve') },
                  { text: translations.chat || 'Chat', onPress: () => Alert.alert(translations.comingSoon || 'Em breve', translations.comingSoon || 'Em breve') },
                  { text: translations.close || 'Fechar', style: 'cancel' }
                ]
              );
            }
          },
          {
            label: translations.settings || 'Configurações',
            icon: 'settings' as MenuIconName,
            route: '/Configuracoes' as const
          }
        ] as MenuItem[]).map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={() => {
              if (item.route) {
                router.push(item.route);
              } else if (item.action) {
                item.action();
              }
            }}
          >
            <View style={styles.menuItemLeft}>
              <Feather name={item.icon} size={20} color={colors.primary} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>{item.label}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert(
              translations.logout || 'Sair da Conta',
              translations.logoutConfirm || 'Tem certeza que deseja sair da sua conta?',
              [
                {
                  text: translations.cancel || 'Cancelar',
                  style: 'cancel'
                },
                {
                  text: translations.logout || 'Sair',
                  style: 'destructive',
                  onPress: async () => {
                    await signOut();
                  }
                }
              ]
            );
          }}
        >
          <Text style={[styles.menuText, { color: colors.text }]}>{translations.logout || 'Sair'}</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <BottomNavigation />
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flex: 1 },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f5e9',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: 60,
  },
  editButton: { marginBottom: 10 },
  editButtonText: { color: '#2196F3', fontSize: 16 },
  username: { fontSize: 18, fontWeight: 'bold' },
  menuContainer: { padding: 15, paddingBottom: 100 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: { fontSize: 16, color: '#333' },

});

