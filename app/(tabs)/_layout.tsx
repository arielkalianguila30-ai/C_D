import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { FavoritesProvider } from '../context/FavoritesContext';
import { UserProfileProvider } from '../context/UserProfileContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { PersistentAuthProvider } from '../context/PersistentAuthContext';
import { BottomNavProvider } from '../context/BottomNavContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
  <LanguageProvider>
  <ThemeProvider>
  <FavoritesProvider>
  <UserProfileProvider>
  <PersistentAuthProvider>
  <BottomNavProvider>
  <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bem-vindo',
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
        }}
      />
        <Tabs.Screen
          name="favoritos"
          options={{
            title: 'Favoritos',
          }}
        />
      <Tabs.Screen
        name="Login2"
        options={{
          title: 'Login',
        }}
      />
      <Tabs.Screen
        name="Register2"
        options={{
          title: 'Register',
        }}
      />
      <Tabs.Screen
        name="MapScreen"
        options={{
          title: 'Mapa',
        }}
      />
      <Tabs.Screen
        name="CompanyDetails"
        options={{
          title: 'Detalhes',
        }}
      />
      {/* Notificações and Notícias/Events screens are file-based routed automatically
          by expo-router (files: app/(tabs)/Notificacoes.tsx and NoticiasEventos.tsx).
          Avoid manually registering them here to prevent duplicate screen name errors. */}
  </Tabs>
    </BottomNavProvider>
    </PersistentAuthProvider>
    </UserProfileProvider>
    </FavoritesProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}
