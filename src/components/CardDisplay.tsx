import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { detectCardBrand } from '../utils/cardUtils';

interface CardDisplayProps {
  number: string;
  holder: string;
  expiry?: string;
  brand?: string;
  bank?: string;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({
  number,
  holder,
  expiry,
  brand,
  bank,
}) => {
  const brandInfo = detectCardBrand(number);
  const displayBrand = brand || brandInfo.brand;
  const brandColor = brandInfo.color;

  // Máscara: mostra últimos 4 dígitos
  const maskedNumber = `•••• •••• •••• ${number.slice(-4)}`;

  return (
    <View style={[styles.card, { borderColor: brandColor }]}>
      {/* Topo do cartão: marca e banco */}
      <View style={styles.cardHeader}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>{displayBrand}</Text>
        </View>
        {bank && <Text style={styles.bankText}>{bank}</Text>}
      </View>

      {/* Número do cartão */}
      <View style={styles.numberContainer}>
        <Text style={styles.cardNumber}>{maskedNumber}</Text>
      </View>

      {/* Rodapé: titular e validade */}
      <View style={styles.cardFooter}>
        <View style={styles.holderContainer}>
          <Text style={styles.holderLabel}>Titular</Text>
          <Text style={styles.holderName}>{holder.toUpperCase()}</Text>
        </View>
        {expiry && (
          <View style={styles.expiryContainer}>
            <Text style={styles.expiryLabel}>Válido até</Text>
            <Text style={styles.expiryDate}>{expiry}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.darkBlue,
    borderRadius: 16,
    padding: 20,
    height: 200,
    justifyContent: 'space-between',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  brandText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  bankText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  numberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  cardNumber: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'Courier New',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderContainer: {
    flex: 1,
  },
  holderLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  holderName: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  expiryContainer: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  expiryDate: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
