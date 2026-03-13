import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatCurrency, formatDate, STATUS_OS } from '../../utils/helpers';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';

const FILTROS = ['Todas', 'aberta', 'em_andamento', 'aguardando_peca', 'pronto', 'entregue', 'cancelada'];
const FILTRO_LABELS = {
  Todas: 'Todas', aberta: 'Abertas', em_andamento: 'Andamento',
  aguardando_peca: 'Ag. Peça', pronto: 'Prontas',
  entregue: 'Entregues', cancelada: 'Canceladas',
};

export default function OrdensScreen({ navigation }) {
  const { ordens, clientes, veiculos } = useApp();
  const [filtro, setFiltro] = useState('Todas');
  const [search, setSearch] = useState('');

  const getClienteNome = id => clientes.find(c => c.id === id)?.nome || '-';
  const getVeiculoLabel = id => {
    const v = veiculos.find(v => v.id === id);
    return v ? `${v.marca} ${v.modelo} • ${v.placa}` : '-';
  };

  const filtered = useMemo(() => {
    let list = [...ordens].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filtro !== 'Todas') list = list.filter(o => o.status === filtro);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(o =>
        o.numero?.toLowerCase().includes(s) ||
        getClienteNome(o.clienteId).toLowerCase().includes(s) ||
        getVeiculoLabel(o.veiculoId).toLowerCase().includes(s)
      );
    }
    return list;
  }, [ordens, filtro, search, clientes, veiculos]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OrdemDetail', { id: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <Text style={styles.osNum}>{item.numero}</Text>
        <Badge status={item.status} />
      </View>
      <Text style={styles.cliente}>{getClienteNome(item.clienteId)}</Text>
      <Text style={styles.veiculo}>{getVeiculoLabel(item.veiculoId)}</Text>
      {item.descricaoProblema ? (
        <Text style={styles.descricao} numberOfLines={1}>{item.descricaoProblema}</Text>
      ) : null}
      <View style={styles.cardBottom}>
        <Text style={styles.data}>{formatDate(item.createdAt)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {item.status === 'entregue' && (
            <Text style={item.pago ? styles.pagoBadge : styles.pendenteBadge}>
              {item.pago ? '✓ Pago' : '⏳ Pendente'}
            </Text>
          )}
          <Text style={styles.valor}>{formatCurrency(item.valorFinal)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por número, cliente ou veículo..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filtro de status */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroScroll}
        contentContainerStyle={styles.filtroContent}>
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroBtn, filtro === f && styles.filtroBtnActive]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filtroTxt, filtro === f && styles.filtroTxtActive]}>
              {FILTRO_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <EmptyState icon="document-text-outline" title="Nenhuma OS encontrada"
            subtitle={search || filtro !== 'Todas' ? 'Altere o filtro ou a busca' : 'Toque no + para criar uma OS'} />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('OrdemForm')}>
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchRow: { padding: 16, paddingBottom: 0 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  filtroScroll: { marginTop: 10 },
  filtroContent: { paddingHorizontal: 16, gap: 8 },
  filtroBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  filtroBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtroTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  filtroTxtActive: { color: colors.black },
  card: {
    backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  osNum: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  cliente: { color: colors.text, fontSize: 14, fontWeight: '700' },
  veiculo: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  descricao: { color: colors.textMuted, fontSize: 12, marginTop: 3, fontStyle: 'italic' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  data: { color: colors.textMuted, fontSize: 12 },
  valor: { color: colors.success, fontSize: 15, fontWeight: '800' },
  pagoBadge: { color: colors.success, fontSize: 11, fontWeight: '700', backgroundColor: colors.success + '22', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  pendenteBadge: { color: colors.warning, fontSize: 11, fontWeight: '700', backgroundColor: colors.warning + '22', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8,
  },
});
