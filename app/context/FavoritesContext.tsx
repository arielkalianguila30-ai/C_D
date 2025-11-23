import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Id = string | number;
type FavoritesContextValue = {
  favorites: Id[];
  isFavorite: (id: Id) => boolean;
  toggleFavorite: (id: Id) => Promise<void>;
  clearFavorites: () => Promise<void>;
  count: number;
};

const FavoritesContext = React.createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = React.useState<Id[]>([]);

  // Load from AsyncStorage once
  React.useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem('@ecoponto:favoritos');
        if (raw) setFavorites(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    load();
  }, []);

  const persist = async (next: Id[]) => {
    try {
      await AsyncStorage.setItem('@ecoponto:favoritos', JSON.stringify(next));
    } catch (e) {
      console.error('Failed to persist favorites', e);
    }
  };

  const toggleFavorite = React.useCallback(async (id: Id) => {
    setFavorites(prev => {
      const exists = prev.some(x => String(x) === String(id));
      const next = exists ? prev.filter(x => String(x) !== String(id)) : [...prev, id];
      // persist but don't await inside setState
      persist(next);
      return next;
    });
  }, []);

  const isFavorite = React.useCallback((id: Id) => favorites.some(x => String(x) === String(id)), [favorites]);

  const clearFavorites = React.useCallback(async () => {
    setFavorites([]);
    await AsyncStorage.removeItem('@ecoponto:favoritos');
  }, []);

  const value = React.useMemo(() => ({ 
    favorites, 
    isFavorite, 
    toggleFavorite, 
    clearFavorites,
    count: favorites.length 
  }), [favorites, isFavorite, toggleFavorite, clearFavorites]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export function useFavorites() {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}

export default FavoritesContext;
