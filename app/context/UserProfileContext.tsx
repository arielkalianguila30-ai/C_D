import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../src/firebase/config';

export type UserProfile = {
  nome?: string;
  email?: string;
  numero?: string;
  idioma?: string;
  // do NOT store raw passwords here for security
  passwordChangedAt?: string;
  photoUri?: string | null;
};

type UserProfileContextValue = {
  profile: UserProfile;
  setProfile: (next: Partial<UserProfile>) => Promise<void>;
  setName: (nome: string) => Promise<void>;
  setPhoto: (uri: string | null) => Promise<void>;
};

const UserProfileContext = React.createContext<UserProfileContextValue | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = React.useState<UserProfile>({});

  // Load profile whenever user changes
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setProfileState({}); // Clear profile if no user
          return;
        }

        const key = `user_profile_${user.uid}`;
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const storedProfile = JSON.parse(raw);
          setProfileState(storedProfile);
        } else {
          // Initialize new profile for new users
          const newProfile = {
            nome: user.displayName || undefined,
            email: user.email || undefined,
            photoUri: user.photoURL || undefined,
          };
          setProfileState(newProfile);
          await AsyncStorage.setItem(key, JSON.stringify(newProfile));
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    };

    // Subscribe to auth changes
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadProfile();
    });

    // Initial load
    loadProfile();

    return () => unsubscribe();
  }, []);

  const persist = async (next: UserProfile) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const key = `user_profile_${user.uid}`;
      await AsyncStorage.setItem(key, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to persist profile', e);
    }
  };

  const setProfile = React.useCallback(async (nextPartial: Partial<UserProfile>) => {
    setProfileState(prev => {
      const next = { ...prev, ...nextPartial };
      persist(next);
      return next;
    });
  }, []);

  const setName = React.useCallback(async (nome: string) => {
    await setProfile({ nome });
  }, [setProfile]);

  const setPhoto = React.useCallback(async (photoUri: string | null) => {
    await setProfile({ photoUri });
  }, [setProfile]);

  const value = React.useMemo(() => ({ profile, setProfile, setName, setPhoto }), [profile, setProfile, setName, setPhoto]);

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

export function useUserProfile() {
  const ctx = React.useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}

export default UserProfileContext;
