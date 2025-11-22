import AsyncStorage from '@react-native-async-storage/async-storage';

export type NavMode = 'both' | 'savings' | 'expenses';
export const NAV_MODE_KEY = '@nav_mode';

export async function getNavMode(): Promise<NavMode> {
  try {
    const raw = await AsyncStorage.getItem(NAV_MODE_KEY);
    if (!raw) return 'both';
    if (raw === 'savings' || raw === 'expenses') return raw;
    return 'both';
  } catch (err) {
    console.error('Erro ao carregar nav mode', err);
    return 'both';
  }
}

export function setNavMode(mode: NavMode) {
  return AsyncStorage.setItem(NAV_MODE_KEY, mode);
}

export function getTabsForMode(mode: NavMode) {
  // default list always includes Wallet and Profile/Kixikila
  const base = [
    { name: 'Carteira', screen: 'Wallet' },
    { name: 'Despesas', screen: 'Expenses' },
    { name: 'Poupança', screen: 'Savings' },
    { name: 'Kixikila', screen: 'Kixikila' },
    { name: 'Perfil', screen: 'Profile' },
  ];

  if (mode === 'both') return base;
  if (mode === 'savings') {
    return base.filter((t) => t.screen !== 'Expenses');
  }
  if (mode === 'expenses') {
    return base.filter((t) => t.screen !== 'Savings');
  }
  return base;
}
