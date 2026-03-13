import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

const StatItem = ({ icon, label, value, color }) => (
  <View style={styles.statItem}>
    <View style={[styles.statIcon, { backgroundColor: color + '1A' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

export default function ConfigScreen() {
  const { user, clientes, veiculos, ordens, estoque, financeiro, agendamentos, logout } = useApp();

  const stats = useMemo(() => {
    const ordensAbertas = ordens.filter(ordem => ordem.status !== 'entregue').length;
    const lancamentosPendentes = financeiro.filter(lancamento => lancamento.status === 'pendente').length;

    return {
      clientes: clientes.length,
      veiculos: veiculos.length,
      ordensAbertas,
      estoque: estoque.length,
      lancamentosPendentes,
      agendamentos: agendamentos.length,
    };
  }, [agendamentos.length, clientes.length, estoque.length, financeiro, ordens, veiculos.length]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="settings-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Resumo operacional e acesso da sessão atual.</Text>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Sessão</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Usuário</Text>
          <Text style={styles.infoValue}>{user?.nome || 'Administrador'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Perfil</Text>
          <Text style={styles.infoValue}>{user?.role || 'admin'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Login</Text>
          <Text style={styles.infoValue}>{user?.username || 'admin'}</Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do sistema</Text>
        <StatItem icon="people-outline" label="Clientes cadastrados" value={stats.clientes} color="#A78BFA" />
        <StatItem icon="car-sport-outline" label="Veículos cadastrados" value={stats.veiculos} color="#38BDF8" />
        <StatItem icon="document-text-outline" label="Ordens em aberto" value={stats.ordensAbertas} color={colors.primary} />
        <StatItem icon="cube-outline" label="Itens no estoque" value={stats.estoque} color={colors.success} />
        <StatItem icon="cash-outline" label="Lançamentos pendentes" value={stats.lancamentosPendentes} color={colors.warning} />
        <StatItem icon="calendar-outline" label="Agendamentos" value={stats.agendamentos} color={colors.info} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Ações</Text>
        <Text style={styles.sectionText}>
          Use esta opção para encerrar a sessão atual e retornar para a tela de login.
        </Text>
        <Button title="Sair do sistema" onPress={logout} variant="danger" style={styles.logoutButton} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: colors.primary + '55',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 12,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  logoutButton: {
    marginTop: 4,
  },
});