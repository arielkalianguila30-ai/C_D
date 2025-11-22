import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../styles/colors';

interface AddCardScreenProps {
  navigation: any;
}

export const AddCardScreen: React.FC<AddCardScreenProps> = ({ navigation }) => {
  const handleAddCard = () => {
    navigation.navigate('CardRegistration');
  };

  const handleSkip = () => {
    navigation.replace('Wallet');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Adicionar Cartão</Text>
          <Text style={styles.subtitle}>Configure seu método de pagamento</Text>
        </View>

        {/* Card Preview */}
        <View style={styles.cardPreviewContainer}>
          <View style={styles.cardPreview}>
            <View style={styles.cardContent}>
              <Text style={styles.cardPlaceholder}>+</Text>
            </View>
            <Text style={styles.cardLabel}>Adicionar Cartão</Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleAddCard}>
            <Text style={styles.buttonText}>Adicionar Cartão</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Pular por enquanto</Text>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 40,
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
  cardPreviewContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cardPreview: {
    alignItems: 'center',
  },
  cardContent: {
    width: 280,
    height: 160,
    borderWidth: 2,
    borderColor: colors.darkBlue,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  cardPlaceholder: {
    fontSize: 48,
    color: colors.darkBlue,
    fontWeight: '300',
  },
  cardLabel: {
    fontSize: 14,
    color: colors.darkBlue,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
    
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkBlue,
    marginBottom: 8,
  },
  inputBorder: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  inputPlaceholder: {
    fontSize: 14,
    color: colors.lightText,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  buttonsContainer: {
    marginTop: 12,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: colors.secondary,
  },
  skipButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
});
