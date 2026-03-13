import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { STATUS_OS } from '../utils/helpers';
import { colors } from '../theme/colors';

export default function Badge({ status, label, color, style }) {
  const statusInfo = STATUS_OS[status];
  const bgColor = color || (statusInfo ? statusInfo.color : colors.textMuted);
  const displayLabel = label || (statusInfo ? statusInfo.label : status || '');

  return (
    <Text style={[styles.badge, { backgroundColor: bgColor + '22', color: bgColor, borderColor: bgColor + '55' }, style]}>
      {displayLabel}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
});
