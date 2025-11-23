import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Id = string;

interface RecentContextValue {
  recent: Id[];
  addRecent: (id: Id) => Promise<void>;
  clearRecent: () => Promise<void>;
}

const RecentContext = createContext<RecentContextValue | undefined>(undefined);

const STORAGE_KEY = '@ecoponto:recent';

export const RecentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recent, setRecent] = useState<Id[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setRecent(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load recent', e);
      }
    };
    load();
  }, []);

  const persist = async (list: Id[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist recent', e);
    }
  };

  const addRecent = async (id: Id) => {
    setRecent(prev => {
      const next = [id, ...prev.filter(x => x !== id)].slice(0, 12);
      persist(next);
      return next;
    });
  };

  const clearRecent = async () => {
    setRecent([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return <RecentContext.Provider value={{ recent, addRecent, clearRecent }}>{children}</RecentContext.Provider>;
};

export function useRecent() {
  const ctx = useContext(RecentContext);
  if (!ctx) throw new Error('useRecent must be used within RecentProvider');
  return ctx;
}

export default RecentContext;
