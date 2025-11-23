import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../src/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface AuthContextData {
  savedCredentials: {
    email: string;
    password: string;
  } | null;
  saveCredentials: (email: string, password: string) => Promise<void>;
  clearCredentials: () => Promise<void>;
  autoSignIn: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [savedCredentials, setSavedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadSavedCredentials();
      } else {
        setSavedCredentials(null);
      }
    });

    // Initial load
    loadSavedCredentials();

    return () => unsubscribe();
  }, []);

  async function loadSavedCredentials() {
    try {
      const user = auth.currentUser;
      if (!user) {
        setSavedCredentials(null);
        return;
      }

      const credentialsJson = await AsyncStorage.getItem(`@ecoponto:credentials:${user.uid}`);
      if (credentialsJson) {
        const credentials = JSON.parse(credentialsJson);
        setSavedCredentials(credentials);
      }
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
    }
  }

  async function saveCredentials(email: string, password: string) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const credentials = { email, password };
      await AsyncStorage.setItem(
        `@ecoponto:credentials:${user.uid}`,
        JSON.stringify(credentials)
      );
      setSavedCredentials(credentials);
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  }

  async function clearCredentials() {
    try {
      const user = auth.currentUser;
      if (user) {
        await AsyncStorage.removeItem(`@ecoponto:credentials:${user.uid}`);
      }
      setSavedCredentials(null);
    } catch (error) {
      console.error('Erro ao limpar credenciais:', error);
    }
  }

  async function autoSignIn(): Promise<boolean> {
    if (savedCredentials) {
      try {
        await signInWithEmailAndPassword(
          auth,
          savedCredentials.email,
          savedCredentials.password
        );
        return true;
      } catch (error) {
        console.error('Erro no login automático:', error);
        return false;
      }
    }
    return false;
  }

  return (
    <AuthContext.Provider
      value={{
        savedCredentials,
        saveCredentials,
        clearCredentials,
        autoSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}