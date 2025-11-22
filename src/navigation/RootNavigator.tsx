import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { AddCardScreen } from '../screens/AddCardScreen';
import { CardRegistrationScreen } from '../screens/CardRegistrationScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { CardsScreen } from '../screens/CardsScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { SavingsScreen } from '../screens/SavingsScreen';
import { SavingsGoalScreen } from '../screens/SavingsGoalScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { KixikilaScreen } from '../screens/KixikilaScreen';
import { KixikilaCalculatorScreen } from '../screens/KixikilaCalculatorScreen';
import { KixikilaInviteScreen } from '../screens/KixikilaInviteScreen';
import { colors } from '../styles/colors';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="AddCard" component={AddCardScreen} />
        <Stack.Screen name="CardRegistration" component={CardRegistrationScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Cards" component={CardsScreen} />
        <Stack.Screen name="Expenses" component={ExpensesScreen} />
        <Stack.Screen name="Savings" component={SavingsScreen} />
        <Stack.Screen name="SavingsGoal" component={SavingsGoalScreen} />
        <Stack.Screen name="Kixikila" component={KixikilaScreen} />
        <Stack.Screen name="KixikilaCalculator" component={KixikilaCalculatorScreen} />
        <Stack.Screen name="KixikilaInvite" component={KixikilaInviteScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
