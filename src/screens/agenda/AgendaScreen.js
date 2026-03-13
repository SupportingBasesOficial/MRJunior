import React, { useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatDate, STATUS_AGENDA } from '../../utils/helpers';
import EmptyState from '../../components/EmptyState';

export default function AgendaScreen({ navigation }) {
  const { agendamentos, deleteAgendamento, updateAgendamento, clientes, veiculos } = useApp();
  const [filtro, setFiltro] = useState('todos');

  const ordenados = useMemo(() => {
    let list = [...agendamentos].sort((a, b) => new Date(a.data) - new Date(b.data));
    if (filtro !== 'todos') list = list.filter(a => a.status === filtro);
    return list;
  }, [agendamentos, filtro]);

  const hoje = new Date().toDateString();
  const agendamentosHoje = agendamentos.filter(a => new Date(a.data).toDateString() === hoje);

  const getClienteNome = id => clientes.find(c => c.id === id)?.nome || 'Cliente não informado';
  const getVeiculoLabel = id => {
    const v = veiculos.find(v => v.id === id);
    return v ? `${v.marca} ${v.modelo} • ${v.placa}` : '';
  };

  const confirmDelete = id => Alert.alert('Excluir', 'Remover este agendamento?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => deleteAgendamento(id) },
  ]);

  const changeStatus = (ag, status) => updateAgendamento(ag.id, { status });

  const renderItem = ({ item }) => {
    const statusInfo = STATUS_AGENDA[item.status] || { label: item.status, color: colors.textMuted };
    const isHoje = new Date(item.data).toDateString() === hoje;
    return (
      <View style={[styles.card, isHoje && styles.cardHoje]}>
        <View style={styles.cardLeft}>
          <View style={[styles.dataBox, isHoje && styles.dataBoxHoje]}>
            <Text style={[styles.dia, isHoje && { color: colors.black }]}>
              {new Date(item.data).getDate()}
            </Text>
            <Text style={[styles.mes, isHoje && { color: colors.black }]}>
              {new Date(item.data).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardTop}>
            <Text style={styles.hora}>{item.hora || '--:--'}</Text>
            <Text style={[styles.statusTag, { color: statusInfo.color, backgroundColor: statusInfo.color + '22' }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.clienteName}>{getClienteNome(item.clienteId)}</Text>
          {item.veiculoId ? <Text style={styles.veiculoLabel}>{getVeiculoLabel(item.veiculoId)}</Text> : null}
          {item.servico ? <Text style={styles.servico}>{item.servico}</Text> : null}
          {item.observacoes ? <Text style={styles.obs}>{item.observacoes}</Text> : null}

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AgendaForm', { id: item.id })}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.getParent()?.navigate('Ordens', {
                screen: 'OrdemForm',
                params: { clienteId: item.clienteId, veiculoId: item.veiculoId },
              })}
            >
              <Ionicons name="document-text-outline" size={16} color={colors.success} />
            </TouchableOpacity>
            {item.status === 'agendado' && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => changeStatus(item, 'confirmado')}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
              </TouchableOpacity>
            )}
            {item.status === 'confirmado' && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => changeStatus(item, 'realizado')}>
                <Ionicons name="flag-outline" size={16} color={colors.info} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(item.id)}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {agendamentosHoje.length > 0 && (
        <View style={styles.hojeAlert}>
          <Ionicons name="today-outline" size={18} color={colors.primary} />
          <Text style={styles.hojeAlertTxt}>{agendamentosHoje.length} agendamento{agendamentosHoje.length > 1 ? 's' : ''} para hoje</Text>
        </View>
      )}

      <View style={styles.filtroRow}>
        {[['todos', 'Todos'], ['agendado', 'Agendados'], ['confirmado', 'Confirmados'], ['realizado', 'Realizados']].map(([k, l]) => (
          <TouchableOpacity key={k} style={[styles.filtroBtn, filtro === k && styles.filtroBtnActive]} onPress={() => setFiltro(k)}>
            <Text style={[styles.filtroTxt, filtro === k && styles.filtroTxtActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={ordenados}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <EmptyState icon="calendar-outline" title="Nenhum agendamento"
            subtitle="Toque no + para agendar um atendimento" />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AgendaForm')}>
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  hojeAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, marginBottom: 4, backgroundColor: colors.primary + '15',
    borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.primary + '44',
  },
  hojeAlertTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  filtroRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 6, flexWrap: 'wrap' },
  filtroBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filtroBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtroTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  filtroTxtActive: { color: colors.black },
  card: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', overflow: 'hidden',
  },
  cardHoje: { borderColor: colors.primary + '88' },
  cardLeft: { width: 64, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', padding: 10 },
  dataBox: { alignItems: 'center' },
  dataBoxHoje: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 8 },
  dia: { color: colors.text, fontSize: 22, fontWeight: '900' },
  mes: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  cardInfo: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hora: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  statusTag: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  clienteName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  veiculoLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  servico: { color: colors.textMuted, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  obs: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  cardActions: { flexDirection: 'row', marginTop: 10, gap: 4 },
  actionBtn: { padding: 6, backgroundColor: colors.surface, borderRadius: 8 },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8,
  },
});
