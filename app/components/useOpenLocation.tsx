import { useRouter } from 'expo-router';
import { useBottomNav } from '../context/BottomNavContext';
import { useCallback } from 'react';

export default function useOpenLocation() {
  const router = useRouter();
  const { setActive } = useBottomNav();

  const openLocation = useCallback(async (from?: string, lat?: number, lng?: number) => {
    try {
      setActive('local');
      // build query string
      const params: string[] = [];
      if (from) params.push(`from=${encodeURIComponent(from)}`);
      if (typeof lat === 'number' && typeof lng === 'number') {
        params.push(`lat=${encodeURIComponent(String(lat))}`);
        params.push(`lng=${encodeURIComponent(String(lng))}`);
      }
      const path = `/localizacao${params.length ? `?${params.join('&')}` : ''}`;
      // cast to any to avoid typed-routes strictness in this repo
      await (router as any).push(path);
    } catch (e) {
      console.warn('Erro ao abrir localização:', e);
    }
  }, [router, setActive]);

  return { openLocation };
}
