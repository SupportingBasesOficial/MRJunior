import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/helpers';
import EmptyState from '../../components/EmptyState';

export default function EstoqueScreen({ navigation }) {
  const { estoque, deletePeca, updatePeca, getPeca } = useApp();
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const filtered = useMemo(() => {
    let list = [...estoque].sort((a, b) => a.nome?.localeCompare(b.nome));
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p =>
        p.nome?.toLowerCase().includes(s) ||
        p.codigo?.toLowerCase().includes(s) ||
        p.categoria?.toLowerCase().includes(s)
      );
    }
    if (filtro === 'baixo') {
      list = list.filter(p => parseInt(p.quantidade) <= parseInt(p.quantidadeMinima || 0));
    } else if (filtro === 'zerado') {
      list = list.filter(p => parseInt(p.quantidade) <= 0);
    }
    return list;
  }, [estoque, search, filtro]);

  const isBaixo = (p) => parseInt(p.quantidade) <= parseInt(p.quantidadeMinima || 0) && parseInt(p.quantidade) > 0;
  const isZerado = (p) => parseInt(p.quantidade) <= 0;

  const confirmDelete = (id, nome) => {
    Alert.alert('Excluir Peça', `Excluir "${nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deletePeca(id) },
    ]);
  };

  const ajustarQtd = (peca, delta) => {
    const novaQtd = Math.max(0, (parseInt(peca.quantidade) || 0) + delta);
    updatePeca(peca.id, { ...peca, quantidade: String(novaQtd) });
  };

  const valorTotal = useMemo(() =>
    estoque.reduce((acc, p) => acc + (parseFloat(p.valorCusto) || 0) * (parseInt(p.quantidade) || 0), 0),
    [estoque]
  );

  const renderItem = ({ item }) => {
    const baixo = isBaixo(item);
    const zerado = isZerado(item);
    return (
      <View style={[styles.card, zerado && styles.cardZerado, baixo && styles.cardBaixo]}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <View style={styles.icon}>
              <Ionicons name="cube-outline" size={20} color={zerado ? colors.danger : baixo ? colors.warning : colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              {item.codigo ? <Text style={styles.codigo}>Cód: {item.codigo}</Text> : null}
              {item.categoria ? <Text style={styles.categoria}>{item.categoria}</Text> : null}
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => navigation.navigate('PecaForm', { id: item.id })} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item.id, item.nome)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.qtdRow}>
            <TouchableOpacity style={styles.qtdBtn} onPress={() => ajustarQtd(item, -1)}>
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.qtd, zerado && { color: colors.danger }, baixo && { color: colors.warning }]}>
              {item.quantidade}
            </Text>
            <TouchableOpacity style={styles.qtdBtn} onPress={() => ajustarQtd(item, 1)}>
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
            {(baixo || zerado) && (
              <Text style={[styles.alertTag, { color: zerado ? colors.danger : colors.warning }]}>
                {zerado ? '⚠ Zerado' : '⚠ Baixo'}
              </Text>
            )}
          </View>
          <View style={styles.valores}>
            <Text style={styles.valorLabel}>Custo: {formatCurrency(item.valorCusto)}</Text>
            <Text style={styles.valorVenda}>Venda: {formatCurrency(item.valorVenda)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Resumo */}
      <View style={styles.resumoRow}>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoVal}>{estoque.length}</Text>
          <Text style={styles.resumoLabel}>Itens</Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={[styles.resumoVal, { color: colors.warning }]}>
            {estoque.filter(p => isBaixo(p)).length}
          </Text>
          <Text style={styles.resumoLabel}>Estoque Baixo</Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoVal}>{formatCurrency(valorTotal)}</Text>
          <Text style={styles.resumoLabel}>Valor Total</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput style={styles.searchInput} placeholder="Buscar peça, código ou categoria..."
            placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtroRow}>
        {[['todos', 'Todos'], ['baixo', 'Estoque Baixo'], ['zerado', 'Zerado']].map(([k, l]) => (
          <TouchableOpacity key={k} style={[styles.filtroBtn, filtro === k && styles.filtroBtnActive]} onPress={() => setFiltro(k)}>
            <Text style={[styles.filtroTxt, filtro === k && styles.filtroTxtActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <EmptyState icon="cube-outline" title="Nenhuma peça encontrada"
            subtitle="Toque no + para cadastrar peças no estoque" />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PecaForm')}>
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  resumoRow: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 10 },
  resumoCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, padding: 12, alignItems: 'center',
  },
  resumoVal: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  resumoLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' },
  searchRow: { paddingHorizontal: 16, paddingBottom: 0 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  filtroRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  filtroBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  filtroBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtroTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  filtroTxtActive: { color: colors.black },
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
  cardZerado: { borderColor: colors.danger + '55' },
  cardBaixo: { borderColor: colors.warning + '55' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  icon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center',
  },
  nome: { color: colors.text, fontSize: 15, fontWeight: '700' },
  codigo: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  categoria: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row' },
  iconBtn: { padding: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtdRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtdBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  qtd: { color: colors.text, fontSize: 22, fontWeight: '900', minWidth: 30, textAlign: 'center' },
  alertTag: { fontSize: 11, fontWeight: '700' },
  valores: { alignItems: 'flex-end' },
  valorLabel: { color: colors.textMuted, fontSize: 12 },
  valorVenda: { color: colors.success, fontSize: 13, fontWeight: '700', marginTop: 2 },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8,
  },
});
