import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function FinanceiroScreen({ navigation }) {
  const { financeiro, deleteLancamento, updateLancamento } = useApp();
  const [tipo, setTipo] = useState('todos');
  const [periodo, setPeriodo] = useState('mes');

  const filtrado = useMemo(() => {
    const agora = new Date();
    return financeiro.filter(l => {
      if (tipo !== 'todos' && l.tipo !== tipo) return false;
      const data = new Date(l.createdAt);
      if (periodo === 'mes') {
        return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
      }
      if (periodo === 'semana') {
        const diff = (agora - data) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [financeiro, tipo, periodo]);

  const totais = useMemo(() => {
    const receitas = filtrado.filter(l => l.tipo === 'receita').reduce((a, l) => a + (parseFloat(l.valor) || 0), 0);
    const despesas = filtrado.filter(l => l.tipo === 'despesa').reduce((a, l) => a + (parseFloat(l.valor) || 0), 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [filtrado]);

  const confirmDelete = (lancamento) => {
    const mensagem = lancamento.osId
      ? 'Este lançamento está vinculado a uma OS. Excluí-lo removerá o registro de pagamento da ordem de serviço. Deseja continuar?'
      : 'Confirma exclusão deste lançamento?';
    Alert.alert('Excluir Lançamento', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteLancamento(lancamento.id) },
    ]);
  };

  const togglePago = (l) => {
    updateLancamento(l.id, { ...l, status: l.status === 'pago' ? 'pendente' : 'pago' });
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Período */}
        <View style={styles.periodoRow}>
          {[['mes', 'Este Mês'], ['semana', 'Esta Semana'], ['todos', 'Todos']].map(([k, l]) => (
            <TouchableOpacity key={k} style={[styles.periodoBtn, periodo === k && styles.periodoBtnActive]} onPress={() => setPeriodo(k)}>
              <Text style={[styles.periodoTxt, periodo === k && styles.periodoTxtActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cards de resumo */}
        <View style={styles.resumoRow}>
          <View style={[styles.resumoCard, { borderColor: colors.success + '55' }]}>
            <Ionicons name="trending-up-outline" size={20} color={colors.success} />
            <Text style={[styles.resumoVal, { color: colors.success }]}>{formatCurrency(totais.receitas)}</Text>
            <Text style={styles.resumoLabel}>Receitas</Text>
          </View>
          <View style={[styles.resumoCard, { borderColor: colors.danger + '55' }]}>
            <Ionicons name="trending-down-outline" size={20} color={colors.danger} />
            <Text style={[styles.resumoVal, { color: colors.danger }]}>{formatCurrency(totais.despesas)}</Text>
            <Text style={styles.resumoLabel}>Despesas</Text>
          </View>
        </View>

        {/* Saldo */}
        <View style={[styles.saldoCard, { borderColor: totais.saldo >= 0 ? colors.success + '44' : colors.danger + '44' }]}>
          <Text style={styles.saldoLabel}>Saldo do Período</Text>
          <Text style={[styles.saldoVal, { color: totais.saldo >= 0 ? colors.success : colors.danger }]}>
            {formatCurrency(totais.saldo)}
          </Text>
        </View>

        {/* Filtro tipo */}
        <View style={styles.tipoRow}>
          {[['todos', 'Todos'], ['receita', 'Receitas'], ['despesa', 'Despesas']].map(([k, l]) => (
            <TouchableOpacity key={k} style={[styles.tipoBtn, tipo === k && styles.tipoBtnActive]} onPress={() => setTipo(k)}>
              <Text style={[styles.tipoTxt, tipo === k && styles.tipoTxtActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lançamentos */}
        <Text style={styles.sectionTitle}>Lançamentos ({filtrado.length})</Text>
        {filtrado.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cash-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTxt}>Nenhum lançamento no período</Text>
          </View>
        ) : (
          filtrado.map(l => (
            <View key={l.id} style={[styles.lancCard, l.tipo === 'receita' ? styles.lancReceita : styles.lancDespesa]}>
              <View style={styles.lancLeft}>
                <View style={[styles.lancIcon, { backgroundColor: (l.tipo === 'receita' ? colors.success : colors.danger) + '22' }]}>
                  <Ionicons
                    name={l.tipo === 'receita' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
                    size={22} color={l.tipo === 'receita' ? colors.success : colors.danger}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lancDesc}>{l.descricao}</Text>
                  <Text style={styles.lancMeta}>{l.categoria} • {formatDate(l.createdAt)}</Text>
                  {l.formaPagamento ? <Text style={styles.lancMeta}>{l.formaPagamento}</Text> : null}
                </View>
              </View>
              <View style={styles.lancRight}>
                <Text style={[styles.lancVal, { color: l.tipo === 'receita' ? colors.success : colors.danger }]}>
                  {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(l.valor)}
                </Text>
                <TouchableOpacity style={styles.pagoTag} onPress={() => togglePago(l)}>
                  <Text style={[styles.pagoTxt, { color: l.status === 'pago' ? colors.success : colors.warning }]}>
                    {l.status === 'pago' ? '✓ Pago' : '⏳ Pendente'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(l)} style={{ marginTop: 4 }}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('LancamentoForm')}>
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  periodoRow: { flexDirection: 'row', padding: 16, gap: 8 },
  periodoBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  periodoBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodoTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  periodoTxtActive: { color: colors.black },
  resumoRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  resumoCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', gap: 6 },
  resumoVal: { fontSize: 20, fontWeight: '900' },
  resumoLabel: { color: colors.textMuted, fontSize: 12 },
  saldoCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, padding: 18, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  saldoLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  saldoVal: { fontSize: 24, fontWeight: '900' },
  tipoRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4, gap: 8 },
  tipoBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  tipoBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tipoTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  tipoTxtActive: { color: colors.black },
  sectionTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, margin: 16, marginBottom: 10 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTxt: { color: colors.textMuted, fontSize: 14 },
  lancCard: {
    marginHorizontal: 16, marginBottom: 10, backgroundColor: colors.card,
    borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'flex-start',
  },
  lancReceita: { borderColor: colors.success + '33' },
  lancDespesa: { borderColor: colors.danger + '33' },
  lancLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  lancIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  lancDesc: { color: colors.text, fontSize: 14, fontWeight: '600' },
  lancMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  lancRight: { alignItems: 'flex-end' },
  lancVal: { fontSize: 15, fontWeight: '800' },
  pagoTag: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.surface },
  pagoTxt: { fontSize: 11, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8,
  },
});
