import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatCurrency, formatDate, STATUS_OS } from '../../utils/helpers';
import Badge from '../../components/Badge';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const { user, ordens, clientes, veiculos, estoque, financeiro } = useApp();
  const navigation = useNavigation();

  const stats = useMemo(() => {
    const hoje = new Date().toDateString();
    const orAbertas = ordens.filter(o => o.status === 'aberta').length;
    const orAndamento = ordens.filter(o => o.status === 'em_andamento').length;
    const orProntas = ordens.filter(o => o.status === 'pronto').length;
    const entreguesHoje = ordens.filter(o =>
      o.status === 'entregue' && new Date(o.updatedAt).toDateString() === hoje
    ).length;

    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    const receitaMes = financeiro
      .filter(l => {
        const d = new Date(l.createdAt);
        return l.tipo === 'receita' && l.status === 'pago' && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      })
      .reduce((acc, l) => acc + (parseFloat(l.valor) || 0), 0);

    const aReceberMes = financeiro
      .filter(l => {
        const d = new Date(l.createdAt);
        return l.tipo === 'receita' && l.status !== 'pago' && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      })
      .reduce((acc, l) => acc + (parseFloat(l.valor) || 0), 0);

    const estoqueBaixo = estoque.filter(p =>
      parseInt(p.quantidade) <= parseInt(p.quantidadeMinima || 0)
    ).length;

    return { orAbertas, orAndamento, orProntas, entreguesHoje, receitaMes, aReceberMes, estoqueBaixo };
  }, [ordens, financeiro, estoque]);

  const recentOrdens = useMemo(() =>
    [...ordens].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [ordens]
  );

  const getClienteNome = (id) => clientes.find(c => c.id === id)?.nome || '-';
  const getVeiculoLabel = (id) => {
    const v = veiculos.find(v => v.id === id);
    return v ? `${v.marca} ${v.modelo} • ${v.placa}` : '-';
  };

  const QuickAction = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={[styles.quickBtn, { borderColor: color + '55' }]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreet}>Olá, {user?.nome || 'Admin'} 👋</Text>
            <Text style={styles.headerSub}>MR Junior — Gestão da Oficina</Text>
          </View>
          <View style={styles.logoSmall}>
            <Ionicons name="construct" size={28} color={colors.primary} />
          </View>
        </View>

        {/* ── Stats Grid ── */}
        <Text style={styles.sectionTitle}>Resumo</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="document-text-outline" label="Abertas" value={stats.orAbertas} color="#3B82F6"
            onPress={() => navigation.navigate('Ordens')} />
          <StatCard icon="hammer-outline" label="Andamento" value={stats.orAndamento} color={colors.primary}
            onPress={() => navigation.navigate('Ordens')} />
          <StatCard icon="checkmark-circle-outline" label="Prontas" value={stats.orProntas} color={colors.success}
            onPress={() => navigation.navigate('Ordens')} />
          <StatCard icon="people-outline" label="Clientes" value={clientes.length} color="#A78BFA"
            onPress={() => navigation.navigate('Clientes')} />
        </View>

        {/* ── Receita do mês ── */}
        <View style={styles.revenueCard}>
          <View>
            <Text style={styles.revLabel}>Receita do Mês (Pago)</Text>
            <Text style={styles.revValue}>{formatCurrency(stats.receitaMes)}</Text>
            {stats.aReceberMes > 0 && (
              <Text style={styles.revPendente}>+ {formatCurrency(stats.aReceberMes)} a receber</Text>
            )}
          </View>
          <View style={styles.revIcon}>
            <Ionicons name="trending-up-outline" size={32} color={colors.primary} />
          </View>
        </View>

        {/* ── Alerta estoque ── */}
        {stats.estoqueBaixo > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => navigation.navigate('Estoque')}
            activeOpacity={0.8}
          >
            <Ionicons name="warning-outline" size={20} color={colors.warning} />
            <Text style={styles.alertText}>
              {stats.estoqueBaixo} {stats.estoqueBaixo === 1 ? 'peça com estoque baixo' : 'peças com estoque baixo'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* ── Ações Rápidas ── */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickRow}>
          <QuickAction icon="add-circle-outline" label="Nova OS" color={colors.primary}
            onPress={() => navigation.navigate('Ordens', { screen: 'OrdemForm' })} />
          <QuickAction icon="person-add-outline" label="Novo Cliente" color="#A78BFA"
            onPress={() => navigation.navigate('Clientes', { screen: 'ClienteForm' })} />
          <QuickAction icon="calendar-outline" label="Agendar" color="#3B82F6"
            onPress={() => navigation.navigate('Mais', { screen: 'Agenda' })} />
          <QuickAction icon="cash-outline" label="Financeiro" color={colors.success}
            onPress={() => navigation.navigate('Mais', { screen: 'Financeiro' })} />
        </View>

        {/* ── Últimas OS ── */}
        <Text style={styles.sectionTitle}>Últimas Ordens de Serviço</Text>
        {recentOrdens.length === 0 ? (
          <View style={styles.emptyOS}>
            <Ionicons name="document-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyOSTxt}>Nenhuma OS criada ainda</Text>
          </View>
        ) : (
          recentOrdens.map(os => (
            <TouchableOpacity
              key={os.id}
              style={styles.osCard}
              onPress={() => navigation.navigate('Ordens', { screen: 'OrdemDetail', params: { id: os.id } })}
              activeOpacity={0.8}
            >
              <View style={styles.osCardHeader}>
                <Text style={styles.osNum}>{os.numero}</Text>
                <Badge status={os.status} />
              </View>
              <Text style={styles.osCliente}>{getClienteNome(os.clienteId)}</Text>
              <Text style={styles.osVeiculo}>{getVeiculoLabel(os.veiculoId)}</Text>
              <View style={styles.osFooter}>
                <Text style={styles.osDate}>{formatDate(os.createdAt)}</Text>
                <Text style={styles.osValor}>{formatCurrency(os.valorFinal)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  headerGreet: { color: colors.text, fontSize: 20, fontWeight: '700' },
  headerSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  logoSmall: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 1,
    paddingHorizontal: 20, marginTop: 22, marginBottom: 12, textTransform: 'uppercase' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10 },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    padding: 14, alignItems: 'center', gap: 6,
  },
  statIcon: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },

  revenueCard: {
    marginHorizontal: 20, marginTop: 14, backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.primary + '44',
    padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  revLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  revValue: { color: colors.primary, fontSize: 28, fontWeight: '900', marginTop: 4 },
    revPendente: { color: colors.warning, fontSize: 12, fontWeight: '600', marginTop: 4 },
  revIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center',
  },

  alertCard: {
    marginHorizontal: 20, marginTop: 12, backgroundColor: colors.warning + '15',
    borderRadius: 12, borderWidth: 1, borderColor: colors.warning + '55',
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10,
  },
  alertText: { flex: 1, color: colors.warning, fontSize: 13, fontWeight: '600' },

  quickRow: { flexDirection: 'row', paddingHorizontal: 14, gap: 10 },
  quickBtn: {
    flex: 1, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', paddingVertical: 14, gap: 8,
  },
  quickIcon: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  osCard: {
    marginHorizontal: 20, marginBottom: 10, backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  osCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  osNum: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  osCliente: { color: colors.text, fontSize: 14, fontWeight: '600' },
  osVeiculo: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  osFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  osDate: { color: colors.textMuted, fontSize: 12 },
  osValor: { color: colors.success, fontSize: 14, fontWeight: '700' },

  emptyOS: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyOSTxt: { color: colors.textMuted, fontSize: 14 },
});
