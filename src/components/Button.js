import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, style }) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        isOutline && styles.outline,
        isDanger && styles.danger,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isOutline || isGhost ? colors.primary : colors.black} />
      ) : (
        <Text style={[
          styles.text,
          size === 'sm' && styles.textSm,
          size === 'lg' && styles.textLg,
          isOutline && styles.textOutline,
          isDanger && styles.textDanger,
          isGhost && styles.textGhost,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sm: { height: 36, borderRadius: 8, paddingHorizontal: 14 },
  lg: { height: 56, borderRadius: 12 },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  text: { color: colors.black, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  textSm: { fontSize: 13 },
  textLg: { fontSize: 17 },
  textOutline: { color: colors.primary },
  textDanger: { color: colors.white },
  textGhost: { color: colors.primary },
});
