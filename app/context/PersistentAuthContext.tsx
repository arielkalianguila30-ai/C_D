import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../src/firebase/config';
import { router } from 'expo-router';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const PersistentAuthContext = createContext<AuthContextData>({} as AuthContextData);

export function PersistentAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listener para mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      // Se houver um usuário logado, redireciona para a tela inicial
      if (currentUser) {
        router.replace('/inicial');
      }
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
      router.replace('/menu');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <PersistentAuthContext.Provider
      value={{
        user,
        isLoading,
        signOut,
      }}
    >
      {children}
    </PersistentAuthContext.Provider>
  );
}

export function usePersistentAuth() {
  const context = useContext(PersistentAuthContext);
  if (!context) {
    throw new Error('usePersistentAuth deve ser usado dentro de um PersistentAuthProvider');
  }
  return context;
}