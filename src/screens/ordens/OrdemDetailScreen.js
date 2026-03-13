import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatCurrency, formatDate, STATUS_OS } from '../../utils/helpers';
import Badge from '../../components/Badge';

const STATUS_FLOW = ['aberta', 'em_andamento', 'aguardando_peca', 'pronto', 'entregue'];

export default function OrdemDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { getOrdem, getCliente, getVeiculo, updateOrdem, deleteOrdem, addLancamento, updateLancamento, updatePeca, financeiro, estoque } = useApp();
  const [statusModal, setStatusModal] = useState(false);

  const ordem = getOrdem(id);
  if (!ordem) return null;

  const cliente = getCliente(ordem.clienteId);
  const veiculo = getVeiculo(ordem.veiculoId);
  const lancamentoRelacionado = financeiro.find(lancamento => lancamento.osId === id);

  const confirmDelete = () => {
    Alert.alert('Excluir OS', `Confirma exclusão da ${ordem.numero}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: () => {
          deleteOrdem(id);
          navigation.goBack();
        },
      },
    ]);
  };

  const changeStatus = (novoStatus) => {
    const updates = { status: novoStatus };

    if (novoStatus === 'entregue') {
      updates.dataConclusao = new Date().toISOString();

      if (!lancamentoRelacionado) {
        addLancamento({
          tipo: 'receita',
          descricao: `OS ${ordem.numero} - ${cliente?.nome || ''}`,
          valor: ordem.valorFinal || 0,
          categoria: 'Serviço',
          formaPagamento: ordem.formaPagamento || 'A definir',
          status: ordem.pago ? 'pago' : 'pendente',
          osId: id,
          data: new Date().toISOString(),
        });
      } else {
        updateLancamento(lancamentoRelacionado.id, {
          ...lancamentoRelacionado,
          descricao: `OS ${ordem.numero} - ${cliente?.nome || ''}`,
          valor: ordem.valorFinal || 0,
          formaPagamento: ordem.formaPagamento || 'A definir',
          status: ordem.pago ? 'pago' : lancamentoRelacionado.status,
        });
      }

      // Deduzir estoque apenas uma vez
      if (!ordem.estoqueDescontado && (ordem.pecas || []).length > 0) {
        (ordem.pecas || []).forEach(peca => {
          const itemEstoque = peca.estoqueId
            ? estoque.find(e => e.id === peca.estoqueId)
            : estoque.find(e => e.nome === peca.nome);
          if (!itemEstoque) return;
          const qtdAtual = parseInt(itemEstoque.quantidade) || 0;
          const qtdUsada = parseInt(peca.quantidade) || 1;
          updatePeca(itemEstoque.id, {
            ...itemEstoque,
            quantidade: String(Math.max(0, qtdAtual - qtdUsada)),
          });
        });
        updates.estoqueDescontado = true;
      }
    }

    // Devolver peças ao estoque se OS for cancelada após já ter descontado
    if (novoStatus === 'cancelada' && ordem.estoqueDescontado) {
      (ordem.pecas || []).forEach(peca => {
        const itemEstoque = peca.estoqueId
          ? estoque.find(e => e.id === peca.estoqueId)
          : estoque.find(e => e.nome === peca.nome);
        if (!itemEstoque) return;
        const qtdAtual = parseInt(itemEstoque.quantidade) || 0;
        const qtdUsada = parseInt(peca.quantidade) || 1;
        updatePeca(itemEstoque.id, {
          ...itemEstoque,
          quantidade: String(qtdAtual + qtdUsada),
        });
      });
      updates.estoqueDescontado = false;
    }

    updateOrdem(id, updates);
    setStatusModal(false);
  };

  const marcarPago = () => {
    Alert.alert('Marcar como Pago', `Confirma pagamento de ${formatCurrency(ordem.valorFinal)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar', onPress: () => {
          if (lancamentoRelacionado) {
            updateLancamento(lancamentoRelacionado.id, {
              ...lancamentoRelacionado,
              valor: ordem.valorFinal || 0,
              formaPagamento: ordem.formaPagamento || lancamentoRelacionado.formaPagamento || 'A definir',
              status: 'pago',
            });
          }

          updateOrdem(id, { valorPago: ordem.valorFinal, pago: true });
          Alert.alert('Sucesso', 'Pagamento registrado!');
        },
      },
    ]);
  };

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const InfoRow = ({ label, value, highlight }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: colors.primary, fontWeight: '700' }]}>{value || '-'}</Text>
    </View>
  );

  const totalServicos = (ordem.servicos || []).reduce(
    (a, s) => a + (parseFloat(s.valor) || 0) * (parseInt(s.quantidade) || 1), 0
  );
  const totalPecas = (ordem.pecas || []).reduce(
    (a, p) => a + (parseFloat(p.valorUnitario) || 0) * (parseInt(p.quantidade) || 1), 0
  );

  return (
    <>
      <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>

        {/* ── Cabeçalho ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.osNum}>{ordem.numero}</Text>
            <Badge status={ordem.status} />
          </View>
          <Text style={styles.dataEntrada}>Entrada: {formatDate(ordem.dataEntrada || ordem.createdAt)}</Text>
          {ordem.dataPrevisao ? (
            <Text style={styles.dataPrevisao}>Previsão: {formatDate(ordem.dataPrevisao)}</Text>
          ) : null}

          {/* Ações */}
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setStatusModal(true)}>
              <Ionicons name="swap-horizontal-outline" size={16} color={colors.primary} />
              <Text style={styles.actionBtnTxt}>Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}
              onPress={() => navigation.navigate('OrdemForm', { id })}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={styles.actionBtnTxt}>Editar</Text>
            </TouchableOpacity>
            {!ordem.pago && (
              <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.success + '55' }]} onPress={marcarPago}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                <Text style={[styles.actionBtnTxt, { color: colors.success }]}>Pago</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.danger + '55' }]} onPress={confirmDelete}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Cliente e Veículo ── */}
        <Section title="Cliente & Veículo">
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => cliente && navigation.navigate('Clientes', { screen: 'ClienteDetail', params: { id: cliente.id } })}
          >
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>{cliente?.nome || '-'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => veiculo && navigation.navigate('Clientes', { screen: 'VeiculoDetail', params: { id: veiculo.id } })}
          >
            <Text style={styles.infoLabel}>Veículo</Text>
            <Text style={[styles.infoValue, veiculo && { color: colors.primary }]}>{veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '-'}</Text>
          </TouchableOpacity>
          {veiculo?.placa && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Placa</Text>
              <Text style={styles.infoValue}>{veiculo.placa}</Text>
            </View>
          )}
          {ordem.kmEntrada && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>KM Entrada</Text>
              <Text style={styles.infoValue}>{ordem.kmEntrada} km</Text>
            </View>
          )}
          {ordem.mecanico && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mecânico</Text>
              <Text style={styles.infoValue}>{ordem.mecanico}</Text>
            </View>
          )}
        </Section>

        {/* ── Problema ── */}
        {ordem.descricaoProblema ? (
          <Section title="Problema Relatado">
            <Text style={styles.descTxt}>{ordem.descricaoProblema}</Text>
          </Section>
        ) : null}

        {/* ── Serviços ── */}
        <Section title={`Serviços (${(ordem.servicos || []).length})`}>
          {(ordem.servicos || []).length === 0 ? (
            <Text style={styles.emptyTxt}>Nenhum serviço adicionado</Text>
          ) : (
            (ordem.servicos || []).map((s, i) => (
              <View key={i} style={[styles.lineItem, i < ordem.servicos.length - 1 && styles.lineItemBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineItemName}>{s.nome}</Text>
                  {s.descricao ? <Text style={styles.lineItemDesc}>{s.descricao}</Text> : null}
                </View>
                <Text style={styles.lineItemQtd}>× {s.quantidade || 1}</Text>
                <Text style={styles.lineItemVal}>{formatCurrency(s.valor)}</Text>
              </View>
            ))
          )}
          {(ordem.servicos || []).length > 0 && (
            <View style={styles.subtotal}>
              <Text style={styles.subtotalLabel}>Subtotal serviços</Text>
              <Text style={styles.subtotalVal}>{formatCurrency(totalServicos)}</Text>
            </View>
          )}
        </Section>

        {/* ── Peças ── */}
        <Section title={`Peças / Materiais (${(ordem.pecas || []).length})`}>
          {(ordem.pecas || []).length === 0 ? (
            <Text style={styles.emptyTxt}>Nenhuma peça adicionada</Text>
          ) : (
            (ordem.pecas || []).map((p, i) => (
              <View key={i} style={[styles.lineItem, i < ordem.pecas.length - 1 && styles.lineItemBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineItemName}>{p.nome}</Text>
                </View>
                <Text style={styles.lineItemQtd}>× {p.quantidade || 1}</Text>
                <Text style={styles.lineItemVal}>{formatCurrency(p.valorUnitario)}</Text>
              </View>
            ))
          )}
          {(ordem.pecas || []).length > 0 && (
            <View style={styles.subtotal}>
              <Text style={styles.subtotalLabel}>Subtotal peças</Text>
              <Text style={styles.subtotalVal}>{formatCurrency(totalPecas)}</Text>
            </View>
          )}
        </Section>

        {/* ── Totais ── */}
        <Section title="Financeiro">
          <InfoRow label="Total Serviços" value={formatCurrency(totalServicos)} />
          <InfoRow label="Total Peças" value={formatCurrency(totalPecas)} />
          {parseFloat(ordem.desconto) > 0 && (
            <InfoRow label="Desconto" value={`- ${formatCurrency(ordem.desconto)}`} />
          )}
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL FINAL</Text>
            <Text style={styles.totalVal}>{formatCurrency(ordem.valorFinal)}</Text>
          </View>
          {ordem.formaPagamento && <InfoRow label="Forma de Pagamento" value={ordem.formaPagamento} />}
          {ordem.pago && (
            <View style={styles.pagoTag}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.pagoTxt}>PAGO</Text>
            </View>
          )}
        </Section>

        {/* ── Obs ── */}
        {ordem.observacoes ? (
          <Section title="Observações">
            <Text style={styles.descTxt}>{ordem.observacoes}</Text>
          </Section>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Modal de status ── */}
      <Modal visible={statusModal} transparent animationType="fade" onRequestClose={() => setStatusModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setStatusModal(false)} activeOpacity={1}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Alterar Status</Text>
            {STATUS_FLOW.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.modalItem, ordem.status === s && styles.modalItemActive]}
                onPress={() => changeStatus(s)}
              >
                <Badge status={s} />
                {ordem.status === s && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalItem, ordem.status === 'cancelada' && styles.modalItemActive]}
              onPress={() => changeStatus('cancelada')}
            >
              <Badge status="cancelada" />
              {ordem.status === 'cancelada' && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.card, margin: 16, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, padding: 18,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  osNum: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  dataEntrada: { color: colors.textSecondary, fontSize: 13 },
  dataPrevisao: { color: colors.warning, fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.primary + '44',
  },
  actionBtnTxt: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  section: { marginHorizontal: 16, marginBottom: 14 },
  sectionTitle: {
    color: colors.textSecondary, fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  sectionCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: 13, flex: 1 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '600', textAlign: 'right', flex: 1 },
  descTxt: { color: colors.text, fontSize: 14, padding: 14, lineHeight: 21 },
  emptyTxt: { color: colors.textMuted, fontSize: 13, padding: 16, textAlign: 'center' },
  lineItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  lineItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  lineItemName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  lineItemDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  lineItemQtd: { color: colors.textSecondary, fontSize: 13, minWidth: 30, textAlign: 'center' },
  lineItemVal: { color: colors.primary, fontSize: 14, fontWeight: '700', minWidth: 80, textAlign: 'right' },
  subtotal: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  subtotalLabel: { color: colors.textSecondary, fontSize: 13 },
  subtotalVal: { color: colors.text, fontSize: 14, fontWeight: '700' },
  totalRow: { backgroundColor: colors.primary + '15', borderBottomWidth: 0 },
  totalLabel: { color: colors.primary, fontSize: 15, fontWeight: '800', flex: 1 },
  totalVal: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  pagoTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, margin: 14,
    backgroundColor: colors.success + '15', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: colors.success + '44',
  },
  pagoTxt: { color: colors.success, fontWeight: '800', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    backgroundColor: colors.card, borderRadius: 16, padding: 20,
    width: '85%', borderWidth: 1, borderColor: colors.border,
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 6 },
  modalItemActive: { backgroundColor: colors.primary + '15' },
});
