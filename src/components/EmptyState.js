import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function EmptyState({ icon = 'folder-open-outline', title, subtitle }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textMuted} />
      <Text style={styles.title}>{title || 'Nenhum item encontrado'}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 40 },
  title: { color: colors.textSecondary, fontSize: 16, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center' },
});
