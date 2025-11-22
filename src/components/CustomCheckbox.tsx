import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

interface CustomCheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  tintColors?: { true: string; false: string };
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  value,
  onValueChange,
  label,
  tintColors,
}) => {
  const checkedColor = tintColors?.true || colors.secondary;
  const uncheckedColor = tintColors?.false || colors.border;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.6}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: value ? checkedColor : colors.white,
            borderColor: value ? checkedColor : uncheckedColor,
          },
        ]}
      >
        {value && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    color: colors.darkText,
    flex: 1,
  },
});
