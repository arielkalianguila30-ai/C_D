import React from 'react';
import { SvgXml } from 'react-native-svg';

interface WalletLogoProps {
  width?: number;
  height?: number;
}

const walletSvg = `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Carteira principal - corpo esquerdo (azul escuro) -->
  <path d="M 40 60 Q 30 60 30 75 L 30 150 Q 30 165 45 165 L 130 165 Q 140 165 140 155 L 140 75 Q 140 60 130 60 Z" fill="#004AAD" stroke="#001A4D" stroke-width="3" stroke-linejoin="round"/>
  
  <!-- Carteira - corpo direito arredondado (azul) -->
  <path d="M 130 60 Q 140 60 140 75 L 140 155 Q 140 165 130 165 L 145 165 Q 160 165 160 150 L 160 75 Q 160 60 145 60 Z" fill="#1E88E5" stroke="#001A4D" stroke-width="3" stroke-linejoin="round"/>
  
  <!-- Notas de dinheiro - primeira (amarelo escuro) -->
  <g transform="translate(95, 50) rotate(-28)">
    <rect x="0" y="0" width="45" height="28" fill="#FFC107" stroke="#001A4D" stroke-width="2.5" rx="3"/>
    <line x1="5" y1="10" x2="40" y2="10" stroke="#001A4D" stroke-width="1.5"/>
  </g>
  
  <!-- Notas de dinheiro - segunda (amarelo ouro) -->
  <g transform="translate(115, 45) rotate(-18)">
    <rect x="0" y="0" width="45" height="28" fill="#FFD700" stroke="#001A4D" stroke-width="2.5" rx="3"/>
    <line x1="5" y1="10" x2="40" y2="10" stroke="#001A4D" stroke-width="1.5"/>
  </g>
  
  <!-- Fecho/botão da carteira -->
  <circle cx="135" cy="120" r="8" fill="#001A4D" stroke="#001A4D" stroke-width="2"/>
  <circle cx="135" cy="120" r="4" fill="#FFD700"/>
</svg>
`;

export const WalletLogo: React.FC<WalletLogoProps> = ({ width = 80, height = 80 }) => {
  return (
    <SvgXml xml={walletSvg} width={width} height={height} />
  );
};
