import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Badge from '../../components/Badge';

export default function ClienteDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { getCliente, getVeiculosByCliente, ordens, deleteCliente } = useApp();
  const cliente = getCliente(id);
  const veiculos = getVeiculosByCliente(id);
  const clienteOrdens = ordens.filter(o => o.clienteId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!cliente) return null;

  const ligaPara = (tel) => Linking.openURL(`tel:${tel.replace(/\D/g, '')}`);

  const confirmDelete = () => {
    Alert.alert('Excluir Cliente', 'Tem certeza? Veículos, ordens de serviço, agendamentos e lançamentos vinculados serão excluídos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: () => {
          deleteCliente(id);
          navigation.goBack();
        },
      },
    ]);
  };

  const InfoRow = ({ icon, label, value, onPress }) => (
    value ? (
      <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
        <Ionicons name={icon} size={16} color={colors.primary} style={{ width: 22 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={[styles.infoValue, onPress && { color: colors.primary }]}>{value}</Text>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={16} color={colors.primary} />}
      </TouchableOpacity>
    ) : null
  );

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{cliente.nome?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.nome}>{cliente.nome}</Text>
        <Text style={styles.since}>Cliente desde {formatDate(cliente.createdAt)}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('ClienteForm', { id })}>
            <Ionicons name="create-outline" size={18} color={colors.black} />
            <Text style={styles.editBtnTxt}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.delBtn} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Contato ── */}
      <Text style={styles.sectionTitle}>Contato</Text>
      <View style={styles.section}>
        <InfoRow icon="call-outline" label="Celular" value={cliente.celular}
          onPress={() => ligaPara(cliente.celular)} />
        <InfoRow icon="phone-portrait-outline" label="Telefone" value={cliente.telefone}
          onPress={() => ligaPara(cliente.telefone)} />
        <InfoRow icon="mail-outline" label="E-mail" value={cliente.email} />
        <InfoRow icon="card-outline" label="CPF/CNPJ" value={cliente.cpf} />
        <InfoRow icon="location-outline" label="Endereço" value={cliente.endereco} />
        {cliente.observacoes ? (
          <View style={styles.infoRow}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.primary} style={{ width: 22 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Observações</Text>
              <Text style={styles.infoValue}>{cliente.observacoes}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* ── Veículos ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Veículos ({veiculos.length})</Text>
        <TouchableOpacity
          style={styles.addSmallBtn}
          onPress={() => navigation.navigate('VeiculoForm', { clienteId: id })}
        >
          <Ionicons name="add" size={16} color={colors.black} />
          <Text style={styles.addSmallTxt}>Adicionar</Text>
        </TouchableOpacity>
      </View>
      {veiculos.length === 0 ? (
        <Text style={styles.emptyTxt}>Nenhum veículo cadastrado</Text>
      ) : (
        veiculos.map(v => (
          <TouchableOpacity
            key={v.id}
            style={styles.veiculoCard}
            onPress={() => navigation.navigate('VeiculoDetail', { id: v.id })}
            activeOpacity={0.8}
          >
            <View style={styles.veiculoIcon}>
              <Ionicons name="car-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.veiculoLabel}>{v.marca} {v.modelo} {v.ano}</Text>
              <Text style={styles.veiculoPlaca}>{v.placa} • {v.cor}</Text>
              {v.km ? <Text style={styles.veiculoKm}>{v.km} km</Text> : null}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('VeiculoForm', { id: v.id, clienteId: id })}>
              <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}

      {/* ── Histórico de OS ── */}
      <Text style={styles.sectionTitle}>Histórico de OS ({clienteOrdens.length})</Text>
      {clienteOrdens.length === 0 ? (
        <Text style={styles.emptyTxt}>Nenhuma OS para este cliente</Text>
      ) : (
        clienteOrdens.map(os => (
          <TouchableOpacity
            key={os.id}
            style={styles.osCard}
            onPress={() => navigation.navigate('Ordens', { screen: 'OrdemDetail', params: { id: os.id } })}
            activeOpacity={0.8}
          >
            <View style={styles.osHeader}>
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
            <View style={styles.osFooter}>
              <Text style={styles.osDate}>{formatDate(os.createdAt)}</Text>
              <Text style={styles.osValor}>{formatCurrency(os.valorFinal)}</Text>
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
  headerCard: {
    backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', padding: 24,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary + '22', borderWidth: 2, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: colors.primary, fontSize: 36, fontWeight: '900' },
  nome: { color: colors.text, fontSize: 22, fontWeight: '800' },
  since: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 22, marginBottom: 10 },
  section: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginHorizontal: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  infoValue: { color: colors.text, fontSize: 14, marginTop: 2 },

  addSmallBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  addSmallTxt: { color: colors.black, fontWeight: '700', fontSize: 12 },

  veiculoCard: {
    backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    marginHorizontal: 16, marginBottom: 8, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  veiculoIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center',
  },
  veiculoLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },
  veiculoPlaca: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  veiculoKm: { color: colors.textMuted, fontSize: 11, marginTop: 1 },

  osCard: {
    backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    marginHorizontal: 16, marginBottom: 8, padding: 14,
  },
  osHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  osNum: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  osFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  osDate: { color: colors.textMuted, fontSize: 12 },
  osValor: { color: colors.success, fontSize: 13, fontWeight: '700' },

  emptyTxt: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginVertical: 16 },
  pagoBadge: { color: colors.success, fontSize: 10, fontWeight: '700', backgroundColor: colors.success + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  pendenteBadge: { color: colors.warning, fontSize: 10, fontWeight: '700', backgroundColor: colors.warning + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
});
