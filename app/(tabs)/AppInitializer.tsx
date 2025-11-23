import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function AppInitializer() {
  const router = useRouter();
  const { autoSignIn } = useAuth();

  useEffect(() => {
    checkSavedCredentials();
  }, []);

  async function checkSavedCredentials() {
    const success = await autoSignIn();
    if (success) {
      router.replace('/inicial');
    } else {
      router.replace('/menu');
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2fd24a" />
    </View>
  );
}