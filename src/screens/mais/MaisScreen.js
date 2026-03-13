import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../components/Card';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

const MenuItem = ({ icon, label, sub, onPress, color }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.menuIcon, { backgroundColor: (color || colors.primary) + '22' }]}>
      <Ionicons name={icon} size={22} color={color || colors.primary} />
    </View>
    <View style={styles.menuInfo}>
      <Text style={styles.menuLabel}>{label}</Text>
      {sub ? <Text style={styles.menuSub}>{sub}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
  </TouchableOpacity>
);

const MetricCard = ({ icon, label, value, color }) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIcon, { backgroundColor: color + '22' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

export default function MaisScreen({ navigation }) {
  const { user, logout, clientes, ordens, estoque, financeiro, agendamentos } = useApp();

  const pendentes = financeiro.filter(lancamento => lancamento.status === 'pendente').length;
  const ordensAbertas = ordens.filter(ordem => ordem.status !== 'entregue' && ordem.status !== 'cancelada').length;

  const confirmLogout = () => {
    Alert.alert('Sair', 'Encerrar a sessão atual?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.profileIcon}>
          <Ionicons name="construct" size={30} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>MR Junior</Text>
          <Text style={styles.profileRole}>Mecânica & Preparação de Motores</Text>
          <Text style={styles.profileUser}>Logado como {user?.nome || 'Administrador'}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard icon="people-outline" label="Clientes" value={clientes.length} color="#A78BFA" />
        <MetricCard icon="document-text-outline" label="OS em aberto" value={ordensAbertas} color={colors.primary} />
        <MetricCard icon="cash-outline" label="Pendências" value={pendentes} color={colors.warning} />
        <MetricCard icon="calendar-outline" label="Agenda" value={agendamentos.length} color={colors.info} />
      </View>

      <Card style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Atalhos</Text>
        <MenuItem
          icon="cash-outline"
          label="Financeiro"
          sub={pendentes > 0 ? `${pendentes} lançamento${pendentes > 1 ? 's' : ''} pendente${pendentes > 1 ? 's' : ''}` : 'Receitas, despesas e saldo'}
          onPress={() => navigation.navigate('Financeiro')}
          color={colors.success}
        />
        <MenuItem
          icon="calendar-outline"
          label="Agenda"
          sub={agendamentos.length > 0 ? `${agendamentos.length} agendamento${agendamentos.length > 1 ? 's' : ''} cadastrado${agendamentos.length > 1 ? 's' : ''}` : 'Organize atendimentos e retornos'}
          onPress={() => navigation.navigate('Agenda')}
          color={colors.info}
        />
        <MenuItem
          icon="settings-outline"
          label="Configurações"
          sub="Resumo do sistema e dados da sessão"
          onPress={() => navigation.navigate('Config')}
          color={colors.primary}
        />
      </Card>

      <Card style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Oficina</Text>
        <MenuItem
          icon="cube-outline"
          label="Estoque"
          sub={`${estoque.length} item${estoque.length !== 1 ? 's' : ''} cadastrado${estoque.length !== 1 ? 's' : ''}`}
          onPress={() => navigation.getParent()?.navigate('Estoque')}
          color={colors.warning}
        />
        <MenuItem
          icon="document-attach-outline"
          label="Ordens de Serviço"
          sub={`${ordens.length} OS no histórico`}
          onPress={() => navigation.getParent()?.navigate('Ordens')}
          color="#38BDF8"
        />
      </Card>

      <Card style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Sessão</Text>
        <MenuItem
          icon="log-out-outline"
          label="Sair do sistema"
          sub="Retorna para a tela de login"
          onPress={confirmLogout}
          color={colors.danger}
        />
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
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary + '18',
    borderWidth: 1.5,
    borderColor: colors.primary + '55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  profileRole: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  profileUser: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  menuSection: {
    gap: 4,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  menuSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});