import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useBottomNav } from '../context/BottomNavContext';
import { useFavorites } from '../context/FavoritesContext';

export default function BottomNavigation() {
  const router = useRouter();
  const { colors } = useTheme();
  const { translations } = useLanguage();
  const { active, setActive, visible, setVisible } = useBottomNav();
  const { count } = useFavorites();

  if (!visible) return null;

  return (
    <View style={[styles.whiteCard, { backgroundColor: colors.surface }]}>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => { setActive('inicial'); (router as any).push('/inicial'); }}
        >
          <Feather name="home" size={24} color={active === 'inicial' ? colors.primary : colors.muted} />
          <Text style={[styles.iconText, { color: active === 'inicial' ? colors.primary : colors.muted }]}>
            {translations.home || 'Início'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => { setActive('mapa'); setVisible(false); (router as any).push('/MapScreen?centerOnUser=true'); }}
        >
          <Feather name="map" size={24} color={active === 'mapa' ? colors.primary : colors.muted} />
          <Text style={[styles.iconText, { color: active === 'mapa' ? colors.primary : colors.muted }]}> 
            {translations.location || 'Mapa'}
          </Text>
        </TouchableOpacity>

        {/* Search button removed from bottom navigation */}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => { setActive('favoritos'); setVisible(true); (router as any).push('/favoritos'); }}
        >
          <View style={styles.iconButtonWithBadge}>
            <Feather name="heart" size={24} color={active === 'favoritos' ? colors.primary : colors.muted} />
            {count > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: '#fff' }]}>{count}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.iconText, { color: active === 'favoritos' ? colors.primary : colors.muted }]}>
            {translations.favorites || 'Favoritos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => { setActive('perfil'); setVisible(true); (router as any).push('/Perfil'); }}
        >
          <Feather name="user" size={24} color={active === 'perfil' ? colors.primary : colors.muted} />
          <Text style={[styles.iconText, { color: active === 'perfil' ? colors.primary : colors.muted }]}>
            {translations.profile || 'Perfil'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  whiteCard: {
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
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  iconText: {
    fontSize: 12,
    marginTop: 4,
  },
  iconButtonWithBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});