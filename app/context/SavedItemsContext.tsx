import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../src/firebase/config';

export interface PontoColeta {
  id: string;
  tipo: 'Ponto de Coleta';
  nome: string;
  endereco: string;
  materiais: string[];
  dataSalvo: string;
}

export interface DicaSustentavel {
  id: string;
  tipo: 'Dica Sustentável';
  titulo: string;
  categoria: string;
  dataSalvo: string;
}

export type ItemSalvo = PontoColeta | DicaSustentavel;

interface SavedItemsContextType {
  savedItems: ItemSalvo[];
  clearSavedItems: () => Promise<void>;
  addSavedItem: (item: ItemSalvo) => Promise<void>;
  removeSavedItem: (itemId: string) => Promise<void>;
}

const SavedItemsContext = createContext<SavedItemsContextType>({
  savedItems: [],
  clearSavedItems: async () => {},
  addSavedItem: async () => {},
  removeSavedItem: async () => {},
});

export function useSavedItems() {
  return useContext(SavedItemsContext);
}

export function SavedItemsProvider({ children }: { children: React.ReactNode }) {
  const [savedItems, setSavedItems] = useState<ItemSalvo[]>([]);

  // Reset saved items when user logs out
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setSavedItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearSavedItems = async () => {
    setSavedItems([]);
  };

  const addSavedItem = async (item: ItemSalvo) => {
    setSavedItems(prev => [...prev, item]);
  };

  const removeSavedItem = async (itemId: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <SavedItemsContext.Provider value={{
      savedItems,
      clearSavedItems,
      addSavedItem,
      removeSavedItem,
    }}>
      {children}
    </SavedItemsContext.Provider>
  );
}