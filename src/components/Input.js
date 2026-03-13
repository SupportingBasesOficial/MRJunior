import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const Input = forwardRef(({ label, error, leftIcon, rightIcon, style, containerStyle, ...props }, ref) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error && styles.inputError]}>
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          style={[styles.input, leftIcon && styles.inputWithLeft, style]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
        {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: colors.danger },
  icon: { marginRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 10 },
  inputWithLeft: { paddingLeft: 0 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
