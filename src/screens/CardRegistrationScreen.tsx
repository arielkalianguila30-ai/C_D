import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setNavMode } from '../utils/navUtils';
import { Alert } from 'react-native';
import { CustomCheckbox } from '../components/CustomCheckbox';
import {
  maskCardNumber,
  maskExpiry,
  maskCVV,
  maskPhoneNumber,
  detectCardBrand,
  detectBankByBIN,
  validateCardNumber,
  validateExpiry,
  validateCVV,
  validateAngolnPhoneNumber,
  unmaskCardNumber,
} from '../utils/cardUtils';

interface CardRegistrationScreenProps {
  navigation: any;
}

type CardType = 'multicaixa' | 'credit' | 'prepaid';

export const CardRegistrationScreen: React.FC<CardRegistrationScreenProps> = ({
  navigation,
}) => {
  const [cardType, setCardType] = useState<CardType>('multicaixa');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCVV] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [cardPurpose, setCardPurpose] = useState<'expenses' | 'savings'>('expenses');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardBrand = detectCardBrand(cardNumber);
  const bank = detectBankByBIN(cardNumber);

  const handleCardNumberChange = (value: string) => {
    setCardNumber(maskCardNumber(value));
  };

  const handleExpiryChange = (value: string) => {
    setExpiryDate(maskExpiry(value));
  };

  const handleCVVChange = (value: string) => {
    setCVV(maskCVV(value));
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(maskPhoneNumber(value));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber || !validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Nome do titular é obrigatório';
    }

    if (!expiryDate || !validateExpiry(expiryDate)) {
      newErrors.expiryDate = 'Data de validade inválida';
    }
    
    if (!phoneNumber || !validateAngolnPhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Número de telemóvel inválido';
    }

    if (!agreeTerms) {
      newErrors.terms = 'Deve aceitar os termos e condições';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterCard = () => {
    if (validateForm()) {
      (async () => {
        try {
          const rawNumber = unmaskCardNumber(cardNumber);
          const brand = detectCardBrand(rawNumber).brand;
          const bankInfo = detectBankByBIN(rawNumber);

          const newCard = {
            id: Date.now().toString(),
            number: rawNumber,
            holder: cardholderName.trim().toUpperCase(),
            expiry: expiryDate,
            bank: bankInfo ? bankInfo.bank : undefined,
            brand: brand,
            enabled: true,
          };

          const stored = await AsyncStorage.getItem('@cards_v1');
          const arr = stored ? JSON.parse(stored) : [];
          arr.push(newCard);
          await AsyncStorage.setItem('@cards_v1', JSON.stringify(arr));

          // persist navigation mode chosen by the user on the card
          await setNavMode(cardPurpose);

          Alert.alert('Sucesso', 'Cartão registrado com sucesso');
          navigation.replace('Cards');
        } catch (err) {
          console.error('Erro ao salvar cartão', err);
          Alert.alert('Erro', 'Não foi possível salvar o cartão. Tente novamente.');
        }
      })();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Registrar Cartão</Text>
          <Text style={styles.subtitle}>Adicione seus dados de pagamento de forma segura</Text>
        </View>

        {/* Card Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Cartão</Text>
          <View style={styles.cardTypeContainer}>
            <TouchableOpacity
              style={[
                styles.cardTypeButton,
                cardType === 'multicaixa' && styles.cardTypeButtonActive,
              ]}
              onPress={() => setCardType('multicaixa')}
            >
              <Text style={styles.cardTypeIcon}>🇦🇴</Text>
              <Text style={styles.cardTypeLabel}>Multicaixa</Text>
              <Text style={styles.cardTypeSubtitle}>Débito</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cardTypeButton,
                cardType === 'credit' && styles.cardTypeButtonActive,
              ]}
              onPress={() => setCardType('credit')}
            >
              <Text style={styles.cardTypeIcon}>💳</Text>
              <Text style={styles.cardTypeLabel}>Crédito</Text>
              <Text style={styles.cardTypeSubtitle}>Visa/MC/Amex</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cardTypeButton,
                cardType === 'prepaid' && styles.cardTypeButtonActive,
              ]}
              onPress={() => setCardType('prepaid')}
            >
              <Text style={styles.cardTypeIcon}>💰</Text>
              <Text style={styles.cardTypeLabel}>Pré-pago</Text>
              <Text style={styles.cardTypeSubtitle}>Vouchers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Brand Detection */}
        {cardNumber && (
          <View style={styles.cardBrandContainer}>
            <View style={[styles.brandBadge, { borderColor: cardBrand.color }]}>
              <Text style={styles.brandBadgeText}>{cardBrand.brand}</Text>
            </View>
            {bank && (
              <View style={styles.bankBadge}>
                <Text style={styles.bankBadgeText}>{bank.bank}</Text>
              </View>
            )}
          </View>
        )}

        {/* Card Number */}
        <View style={styles.section}>
          <Text style={styles.label}>Número do Cartão</Text>
          <TextInput
            style={[styles.input, errors.cardNumber && styles.inputError]}
            placeholder="0000-0000-0000-0000"
            placeholderTextColor={colors.lightText}
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            maxLength={19}
          />
          {errors.cardNumber && (
            <Text style={styles.errorText}>{errors.cardNumber}</Text>
          )}
        </View>

        {/* Cardholder Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Nome do Titular</Text>
          <TextInput
            style={[styles.input, errors.cardholderName && styles.inputError]}
            placeholder="Como sai no cartão"
            placeholderTextColor={colors.lightText}
            value={cardholderName}
            onChangeText={setCardholderName}
          />
          {errors.cardholderName && (
            <Text style={styles.errorText}>{errors.cardholderName}</Text>
          )}
        </View>

        {/* Expiry and CVV */}
        <View style={styles.rowContainer}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Validade (MM/AA)</Text>
            <TextInput
              style={[styles.input, errors.expiryDate && styles.inputError]}
              placeholder="MM/AA"
              placeholderTextColor={colors.lightText}
              keyboardType="numeric"
              value={expiryDate}
              onChangeText={handleExpiryChange}
              maxLength={5}
            />
            {errors.expiryDate && (
              <Text style={styles.errorText}>{errors.expiryDate}</Text>
            )}
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={[styles.input, errors.cvv && styles.inputError]}
              placeholder="000"
              placeholderTextColor={colors.lightText}
              keyboardType="numeric"
              value={cvv}
              onChangeText={handleCVVChange}
              secureTextEntry
              maxLength={4}
            />
            {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.section}>
          <Text style={styles.label}>Número de Telemóvel</Text>
          <Text style={styles.helperText}>Para confirmar transações via OTP</Text>
          <TextInput
            style={[styles.input, errors.phoneNumber && styles.inputError]}
            placeholder="924 XXXXXX ou +244 92X XXXXXX"
            placeholderTextColor={colors.lightText}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}
        </View>

        {/* Bank Info */}
        {bank && (
          <View style={styles.bankInfoContainer}>
            <Text style={styles.bankInfoIcon}>🏦</Text>
            <View style={styles.bankInfoContent}>
              <Text style={styles.bankInfoTitle}>{bank.bank}</Text>
              <Text style={styles.bankInfoSubtitle}>Banco emissor detectado</Text>
            </View>
          </View>
        )}

        {/* Save Card Checkbox */}
        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            value={saveCard}
            onValueChange={setSaveCard}
            tintColors={{ true: colors.secondary, false: colors.border }}
          />
          <Text style={styles.checkboxLabel}>Guardar cartão para pagamentos futuros</Text>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <View style={styles.checkboxContainer}>
            <CustomCheckbox
              value={agreeTerms}
              onValueChange={setAgreeTerms}
              tintColors={{ true: colors.secondary, false: colors.border }}
            />
            <Text style={styles.termsText}>
              Aceito os termos de serviço e política de privacidade
            </Text>
          </View>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Uma pequena cobrança de teste (0.99 AOA) será realizada para validar o cartão e
              revertida automaticamente. Sua privacidade é protegida.
            </Text>
          </View>
        </View>

        {/* Card purpose selection (Gastos / Poupança) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo do Cartão</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[styles.cardPurposeButton, cardPurpose === 'expenses' && styles.cardPurposeActive]}
              onPress={() => setCardPurpose('expenses')}
            >
              <Text style={[styles.cardPurposeText, cardPurpose === 'expenses' && styles.cardPurposeTextActive]}>Gastos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardPurposeButton, cardPurpose === 'savings' && styles.cardPurposeActive]}
              onPress={() => setCardPurpose('savings')}
            >
              <Text style={[styles.cardPurposeText, cardPurpose === 'savings' && styles.cardPurposeTextActive]}>Poupança</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={handleRegisterCard}
          >
            <Text style={styles.buttonText}>Registrar Cartão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.lightText,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkBlue,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.lightText,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.darkText,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  cardTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTypeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cardTypeButtonActive: {
    borderColor: colors.secondary,
    backgroundColor: '#E3F2FD',
  },
  cardTypeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTypeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 2,
  },
  cardTypeSubtitle: {
    fontSize: 11,
    color: colors.lightText,
  },
  cardBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  brandBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 8,
  },
  brandBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  bankBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.secondary,
    borderRadius: 8,
  },
  bankBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  bankInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginBottom: 20,
  },
  bankInfoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  bankInfoContent: {
    flex: 1,
  },
  bankInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  bankInfoSubtitle: {
    fontSize: 11,
    color: colors.lightText,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.darkText,
    marginLeft: 10,
    flex: 1,
  },
  termsContainer: {
    marginBottom: 24,
    paddingVertical: 12,
  },
  termsText: {
    fontSize: 13,
    color: colors.darkText,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: colors.secondary,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  cardPurposeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  cardPurposeActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  cardPurposeText: {
    color: colors.darkBlue,
    fontWeight: '700',
  },
  cardPurposeTextActive: {
    color: colors.white,
  },
});
