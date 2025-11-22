// Tipos de navegação
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
};

// Tipos de usuário
export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

// Tipos de transação
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  description: string;
}

// Tipos de conta
export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'savings' | 'investment';
  balance: number;
  bankName: string;
}
