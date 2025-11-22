import React from 'react';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

interface NavIconProps {
  screen: string;
  size?: number;
  active?: boolean;
}

const NavIcon: React.FC<NavIconProps> = ({ screen, size = 22, active = false }) => {
  const color = active ? colors.secondary : colors.lightText;
  switch (screen) {
    case 'Wallet':
      return <FontAwesome5 name="wallet" size={size} color={color} />;
    case 'Expenses':
      return <Ionicons name="stats-chart" size={size} color={color} />;
    case 'Savings':
      return <FontAwesome5 name="piggy-bank" size={size} color={color} />;
    case 'Kixikila':
      return <FontAwesome5 name="users" size={size} color={color} />;
    case 'Profile':
      return <Ionicons name="person" size={size} color={color} />;
    default:
      return <Ionicons name="ellipse" size={size} color={color} />;
  }
};

export default NavIcon;
