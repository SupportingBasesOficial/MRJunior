import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Badge from '../../components/Badge';

export default function VeiculoDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { getVeiculo, getCliente, ordens, deleteVeiculo } = useApp();
  const veiculo = getVeiculo(id);
  const cliente = veiculo ? getCliente(veiculo.clienteId) : null;
  const veiculoOrdens = ordens
    .filter(o => o.veiculoId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!veiculo) return null;

  const confirmDelete = () => {
    Alert.alert('Excluir Veículo', 'Deseja remover este veículo? Ordens de serviço, agendamentos e lançamentos vinculados também serão excluídos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: () => {
          deleteVeiculo(id);
          navigation.goBack();
        },
      },
    ]);
  };

  const Row = ({ icon, label, value }) =>
    value ? (
      <View style={styles.row}>
        <Ionicons name={icon} size={16} color={colors.primary} style={{ width: 22 }} />
        <View>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue}>{value}</Text>
        </View>
      </View>
    ) : null;

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.carIcon}>
          <Ionicons name="car-sport-outline" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>{veiculo.marca} {veiculo.modelo}</Text>
        <Text style={styles.placa}>{veiculo.placa}</Text>
        {cliente && (
          <TouchableOpacity
            style={styles.ownerBtn}
            onPress={() => navigation.navigate('ClienteDetail', { id: cliente.id })}
          >
            <Ionicons name="person-outline" size={14} color={colors.primary} />
            <Text style={styles.ownerTxt}>{cliente.nome}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.editBtn}
            onPress={() => navigation.navigate('VeiculoForm', { id, clienteId: veiculo.clienteId })}>
            <Ionicons name="create-outline" size={18} color={colors.black} />
            <Text style={styles.editBtnTxt}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.delBtn} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dados */}
      <Text style={styles.sectionTitle}>Informações</Text>
      <View style={styles.card}>
        <Row icon="calendar-outline" label="Ano" value={veiculo.ano} />
        <Row icon="color-palette-outline" label="Cor" value={veiculo.cor} />
        <Row icon="speedometer-outline" label="KM" value={veiculo.km ? `${veiculo.km} km` : null} />
        <Row icon="flame-outline" label="Combustível" value={veiculo.combustivel} />
        <Row icon="settings-outline" label="Motor" value={veiculo.motor} />
        <Row icon="barcode-outline" label="Chassi" value={veiculo.chassi} />
        {veiculo.observacoes ? (
          <View style={styles.row}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} style={{ width: 22 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Observações</Text>
              <Text style={styles.rowValue}>{veiculo.observacoes}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Histórico */}
      <Text style={styles.sectionTitle}>Histórico de OS ({veiculoOrdens.length})</Text>
      {veiculoOrdens.length === 0 ? (
        <Text style={styles.emptyTxt}>Nenhuma OS para este veículo</Text>
      ) : (
        veiculoOrdens.map(os => (
          <TouchableOpacity
            key={os.id}
            style={styles.osCard}
            onPress={() => navigation.navigate('Ordens', { screen: 'OrdemDetail', params: { id: os.id } })}
            activeOpacity={0.8}
          >
            <View style={styles.osTop}>
              <Text style={styles.osNum}>{os.numero}</Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {os.status === 'entregue' && (
                  <Text style={os.pago ? styles.pagoBadge : styles.pendenteBadge}>
                    {os.pago ? '✓ Pago' : '⏳ Pend.'}
                  </Text>
                )}
                <Badge status={os.status} />
              </View>
            </View>
            <View style={styles.osBottom}>
              <Text style={styles.osDate}>{formatDate(os.createdAt)}</Text>
              <Text style={styles.osVal}>{formatCurrency(os.valorFinal)}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.card, margin: 16, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', padding: 24,
  },
  carIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary + '15', borderWidth: 2, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  placa: {
    color: colors.primary, fontSize: 18, fontWeight: '900', letterSpacing: 3,
    backgroundColor: colors.primary + '15', paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 8, marginTop: 8,
  },
  ownerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  ownerTxt: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  headerBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
  },
  editBtnTxt: { color: colors.black, fontWeight: '700', fontSize: 14 },
  delBtn: {
    backgroundColor: colors.danger + '22', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.danger + '55',
  },
  sectionTitle: {
    color: colors.textSecondary, fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    marginHorizontal: 16, marginTop: 22, marginBottom: 10,
  },
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
  rowLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  rowValue: { color: colors.text, fontSize: 14, marginTop: 2 },
  osCard: {
    backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    marginHorizontal: 16, marginBottom: 8, padding: 14,
  },
  osTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  osNum: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  osBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  osDate: { color: colors.textMuted, fontSize: 12 },
  osVal: { color: colors.success, fontSize: 13, fontWeight: '700' },
  emptyTxt: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginVertical: 16 },
  pagoBadge: { color: colors.success, fontSize: 10, fontWeight: '700', backgroundColor: colors.success + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  pendenteBadge: { color: colors.warning, fontSize: 10, fontWeight: '700', backgroundColor: colors.warning + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
});
