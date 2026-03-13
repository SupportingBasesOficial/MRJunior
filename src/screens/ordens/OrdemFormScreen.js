import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, Modal, FlatList, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { formatCurrency, calcOrdemTotal } from '../../utils/helpers';
import Input from '../../components/Input';
import Button from '../../components/Button';

const FORMAS_PAGAMENTO = ['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Cheque', 'Transferência', 'A definir'];

export default function OrdemFormScreen({ route, navigation }) {
  const { id, clienteId: paramClienteId, veiculoId: paramVeiculoId } = route.params || {};
  const { addOrdem, updateOrdem, getOrdem, clientes, veiculos, estoque } = useApp();

  const [form, setForm] = useState({
    clienteId: paramClienteId || '', veiculoId: paramVeiculoId || '', dataEntrada: new Date().toISOString().slice(0, 10),
    dataPrevisao: '', mecanico: '', kmEntrada: '', descricaoProblema: '',
    servicos: [], pecas: [], desconto: '0', formaPagamento: 'PIX', observacoes: '',
  });

  const [clienteModal, setClienteModal] = useState(false);
  const [veiculoModal, setVeiculoModal] = useState(false);
  const [pagModal, setPagModal] = useState(false);
  const [estoqueModal, setEstoqueModal] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [searchEstoque, setSearchEstoque] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      const o = getOrdem(id);
      if (o) setForm({
        clienteId: o.clienteId || '', veiculoId: o.veiculoId || '',
        dataEntrada: o.dataEntrada ? o.dataEntrada.slice(0, 10) : new Date().toISOString().slice(0, 10),
        dataPrevisao: o.dataPrevisao ? o.dataPrevisao.slice(0, 10) : '',
        mecanico: o.mecanico || '', kmEntrada: o.kmEntrada || '',
        descricaoProblema: o.descricaoProblema || '',
        servicos: o.servicos || [], pecas: o.pecas || [],
        desconto: String(o.desconto || 0), formaPagamento: o.formaPagamento || 'PIX',
        observacoes: o.observacoes || '',
      });
    }
  }, [id]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const clienteAtual = clientes.find(c => c.id === form.clienteId);
  const veiculosDoCliente = veiculos.filter(v => v.clienteId === form.clienteId);
  const veiculoAtual = veiculos.find(v => v.id === form.veiculoId);
  const clientesFiltrados = clientes.filter(c =>
    !searchCliente || c.nome.toLowerCase().includes(searchCliente.toLowerCase())
  );
  const estoqueFiltrado = estoque
    .filter(peca => {
      const termo = searchEstoque.trim().toLowerCase();
      if (!termo) return true;
      return (
        peca.nome?.toLowerCase().includes(termo) ||
        peca.codigo?.toLowerCase().includes(termo) ||
        peca.categoria?.toLowerCase().includes(termo)
      );
    })
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

  const total = calcOrdemTotal(form.servicos, form.pecas);
  const desconto = parseFloat(form.desconto) || 0;
  const totalFinal = total - desconto;

  // ── Serviços ──
  const addServico = () => {
    set('servicos', [...form.servicos, { nome: '', descricao: '', valor: '', quantidade: '1' }]);
  };
  const updateServico = (idx, key, val) => {
    const list = [...form.servicos];
    list[idx] = { ...list[idx], [key]: val };
    set('servicos', list);
  };
  const removeServico = (idx) => {
    set('servicos', form.servicos.filter((_, i) => i !== idx));
  };

  // ── Peças ──
  const addPeca = () => {
    set('pecas', [...form.pecas, { nome: '', valorUnitario: '', quantidade: '1' }]);
  };
  const addPecaDoEstoque = (peca) => {
    const index = form.pecas.findIndex(item => item.estoqueId === peca.id);

    if (index >= 0) {
      const list = [...form.pecas];
      const quantidadeAtual = parseInt(list[index].quantidade, 10) || 0;
      list[index] = { ...list[index], quantidade: String(quantidadeAtual + 1) };
      set('pecas', list);
    } else {
      set('pecas', [...form.pecas, {
        estoqueId: peca.id,
        nome: peca.nome,
        valorUnitario: String(peca.valorVenda || 0),
        quantidade: '1',
      }]);
    }

    setEstoqueModal(false);
    setSearchEstoque('');
  };
  const updatePeca = (idx, key, val) => {
    const list = [...form.pecas];
    list[idx] = { ...list[idx], [key]: val };
    set('pecas', list);
  };
  const removePeca = (idx) => {
    set('pecas', form.pecas.filter((_, i) => i !== idx));
  };

  const isValidDateInput = (value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;

    return parsed.toISOString().slice(0, 10) === value;
  };

  const validate = () => {
    const err = {};
    if (!form.clienteId) err.clienteId = 'Selecione o cliente';
    if (!form.veiculoId) err.veiculoId = 'Selecione o veículo';
    if (!isValidDateInput(form.dataEntrada)) err.dataEntrada = 'Use uma data válida no formato AAAA-MM-DD';
    if (!isValidDateInput(form.dataPrevisao)) err.dataPrevisao = 'Use uma data válida no formato AAAA-MM-DD';
    if (totalFinal < 0) err.desconto = 'O desconto não pode deixar o total negativo';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }
    const normalizeDecimal = (v) => String(parseFloat(String(v).replace(',', '.')) || 0);
    const data = {
      ...form,
      dataEntrada: form.dataEntrada ? new Date(`${form.dataEntrada}T00:00:00`).toISOString() : new Date().toISOString(),
      dataPrevisao: form.dataPrevisao ? new Date(`${form.dataPrevisao}T00:00:00`).toISOString() : null,
      desconto: parseFloat(String(form.desconto).replace(',', '.')) || 0,
      servicos: form.servicos.map(s => ({ ...s, valor: normalizeDecimal(s.valor) })),
      pecas: form.pecas.map(p => ({ ...p, valorUnitario: normalizeDecimal(p.valorUnitario) })),
    };
    if (id) {
      updateOrdem(id, data);
      Alert.alert('Sucesso', 'OS atualizada!');
    } else {
      addOrdem(data);
      Alert.alert('Sucesso', 'OS criada!');
    }
    navigation.goBack();
  };

  const SectionBox = ({ title, children, action }) => (
    <View style={styles.sectionBox}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* ── Cliente ── */}
          <SectionBox title="Cliente *">
            <TouchableOpacity
              style={[styles.selector, errors.clienteId && styles.selectorError]}
              onPress={() => setClienteModal(true)}
            >
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.selectorTxt, !clienteAtual && styles.selectorPlaceholder]}>
                {clienteAtual ? clienteAtual.nome : 'Selecionar cliente...'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            {errors.clienteId ? <Text style={styles.errTxt}>{errors.clienteId}</Text> : null}
          </SectionBox>

          {/* ── Veículo ── */}
          <SectionBox title="Veículo *">
            <TouchableOpacity
              style={[styles.selector, errors.veiculoId && styles.selectorError]}
              onPress={() => {
                if (!form.clienteId) { Alert.alert('Atenção', 'Selecione o cliente primeiro.'); return; }
                setVeiculoModal(true);
              }}
            >
              <Ionicons name="car-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.selectorTxt, !veiculoAtual && styles.selectorPlaceholder]}>
                {veiculoAtual ? `${veiculoAtual.marca} ${veiculoAtual.modelo} • ${veiculoAtual.placa}` : 'Selecionar veículo...'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            {errors.veiculoId ? <Text style={styles.errTxt}>{errors.veiculoId}</Text> : null}
          </SectionBox>

          {/* ── Datas e Info ── */}
          <SectionBox title="Informações">
            <Input label="Data de Entrada" value={form.dataEntrada} onChangeText={v => set('dataEntrada', v)}
              placeholder="AAAA-MM-DD" keyboardType="numeric" error={errors.dataEntrada} containerStyle={{ marginBottom: 10 }} />
            <Input label="Previsão de Conclusão" value={form.dataPrevisao} onChangeText={v => set('dataPrevisao', v)}
              placeholder="AAAA-MM-DD" keyboardType="numeric" error={errors.dataPrevisao} containerStyle={{ marginBottom: 10 }} />
            <Input label="Mecânico Responsável" value={form.mecanico} onChangeText={v => set('mecanico', v)}
              placeholder="Nome do mecânico" autoCapitalize="words" containerStyle={{ marginBottom: 10 }} />
            <Input label="KM na Entrada" value={form.kmEntrada} onChangeText={v => set('kmEntrada', v)}
              placeholder="Ex: 85000" keyboardType="numeric" containerStyle={{ marginBottom: 0 }} />
          </SectionBox>

          {/* ── Problema ── */}
          <SectionBox title="Problema Relatado">
            <Input value={form.descricaoProblema} onChangeText={v => set('descricaoProblema', v)}
              placeholder="Descreva o problema relatado pelo cliente..." multiline numberOfLines={4}
              style={{ minHeight: 90, textAlignVertical: 'top' }} containerStyle={{ marginBottom: 0 }} />
          </SectionBox>

          {/* ── Serviços ── */}
          <SectionBox title={`Serviços (${form.servicos.length})`} action={
            <TouchableOpacity style={styles.addBtn} onPress={addServico}>
              <Ionicons name="add" size={16} color={colors.black} />
              <Text style={styles.addBtnTxt}>Add</Text>
            </TouchableOpacity>
          }>
            {form.servicos.length === 0 ? (
              <Text style={styles.emptyTxt}>Nenhum serviço. Toque em "Add".</Text>
            ) : (
              form.servicos.map((s, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Input value={s.nome} onChangeText={v => updateServico(i, 'nome', v)}
                      placeholder="Nome do serviço *" containerStyle={{ marginBottom: 6 }} />
                    <View style={styles.rowTwo}>
                      <Input value={s.valor} onChangeText={v => updateServico(i, 'valor', v)}
                        placeholder="Valor R$" keyboardType="decimal-pad"
                        containerStyle={{ flex: 1, marginBottom: 0, marginRight: 8 }} />
                      <Input value={s.quantidade} onChangeText={v => updateServico(i, 'quantidade', v)}
                        placeholder="Qtd" keyboardType="numeric"
                        containerStyle={{ width: 70, marginBottom: 0 }} />
                    </View>
                    <View style={styles.subtotalRow}>
                      <Text style={styles.subtotalTxt}>
                        Subtotal: {formatCurrency((parseFloat(s.valor) || 0) * (parseInt(s.quantidade) || 1))}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeServico(i)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </SectionBox>

          {/* ── Peças ── */}
          <SectionBox title={`Peças / Materiais (${form.pecas.length})`} action={
            <View style={styles.rowTwo}>
              {estoque.length > 0 && (
                <TouchableOpacity style={[styles.addBtn, { marginRight: 6, backgroundColor: colors.surface }]}
                  onPress={() => setEstoqueModal(true)}>
                  <Ionicons name="cube-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.addBtn} onPress={addPeca}>
                <Ionicons name="add" size={16} color={colors.black} />
                <Text style={styles.addBtnTxt}>Add</Text>
              </TouchableOpacity>
            </View>
          }>
            {form.pecas.length === 0 ? (
              <Text style={styles.emptyTxt}>Nenhuma peça. Toque em "Add".</Text>
            ) : (
              form.pecas.map((p, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Input value={p.nome} onChangeText={v => updatePeca(i, 'nome', v)}
                      placeholder="Nome da peça *" containerStyle={{ marginBottom: 6 }} />
                    <View style={styles.rowTwo}>
                      <Input value={p.valorUnitario} onChangeText={v => updatePeca(i, 'valorUnitario', v)}
                        placeholder="Valor unit. R$" keyboardType="decimal-pad"
                        containerStyle={{ flex: 1, marginBottom: 0, marginRight: 8 }} />
                      <Input value={p.quantidade} onChangeText={v => updatePeca(i, 'quantidade', v)}
                        placeholder="Qtd" keyboardType="numeric"
                        containerStyle={{ width: 70, marginBottom: 0 }} />
                    </View>
                    <View style={styles.subtotalRow}>
                      <Text style={styles.subtotalTxt}>
                        Subtotal: {formatCurrency((parseFloat(p.valorUnitario) || 0) * (parseInt(p.quantidade) || 1))}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removePeca(i)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </SectionBox>

          {/* ── Totais ── */}
          <SectionBox title="Valores">
            <View style={styles.totalLine}>
              <Text style={styles.totalLineLabel}>Total Serviços</Text>
              <Text style={styles.totalLineVal}>{formatCurrency(calcOrdemTotal(form.servicos, []))}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLineLabel}>Total Peças</Text>
              <Text style={styles.totalLineVal}>{formatCurrency(calcOrdemTotal([], form.pecas))}</Text>
            </View>
            <Input label="Desconto (R$)" value={form.desconto} onChangeText={v => set('desconto', v)}
              placeholder="0,00" keyboardType="decimal-pad" error={errors.desconto} containerStyle={{ marginBottom: 10 }} />
            <View style={[styles.totalLine, styles.totalFinalLine]}>
              <Text style={styles.totalFinalLabel}>TOTAL FINAL</Text>
              <Text style={styles.totalFinalVal}>{formatCurrency(totalFinal)}</Text>
            </View>

            {/* Forma de pagamento */}
            <Text style={styles.fieldLabel}>Forma de Pagamento</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setPagModal(true)}>
              <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.selectorTxt}>{form.formaPagamento || 'Selecionar...'}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </SectionBox>

          {/* ── Obs ── */}
          <SectionBox title="Observações">
            <Input value={form.observacoes} onChangeText={v => set('observacoes', v)}
              placeholder="Observações internas sobre a OS..." multiline numberOfLines={3}
              style={{ minHeight: 70, textAlignVertical: 'top' }} containerStyle={{ marginBottom: 0 }} />
          </SectionBox>

          <Button title={id ? 'Salvar Alterações' : 'Criar Ordem de Serviço'} onPress={handleSave} style={{ marginTop: 8 }} />
          <Button title="Cancelar" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Modal Cliente ── */}
      <Modal visible={clienteModal} transparent animationType="slide" onRequestClose={() => setClienteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Cliente</Text>
              <TouchableOpacity onPress={() => setClienteModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalSearch}
              placeholder="Buscar cliente..."
              placeholderTextColor={colors.textMuted}
              value={searchCliente}
              onChangeText={setSearchCliente}
            />
            <FlatList
              data={clientesFiltrados}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => {
                  set('clienteId', item.id);
                  set('veiculoId', '');
                  setClienteModal(false);
                  setSearchCliente('');
                }}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarTxt}>{item.nome[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.modalItemName}>{item.nome}</Text>
                    <Text style={styles.modalItemSub}>{item.celular || item.telefone || ''}</Text>
                  </View>
                  {form.clienteId === item.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyTxt}>Nenhum cliente encontrado</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* ── Modal Veículo ── */}
      <Modal visible={veiculoModal} transparent animationType="slide" onRequestClose={() => setVeiculoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Veículo</Text>
              <TouchableOpacity onPress={() => setVeiculoModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {veiculosDoCliente.length === 0 ? (
              <Text style={[styles.emptyTxt, { padding: 20 }]}>Este cliente não tem veículos cadastrados.</Text>
            ) : (
              <FlatList
                data={veiculosDoCliente}
                keyExtractor={i => i.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => { set('veiculoId', item.id); setVeiculoModal(false); }}>
                    <Ionicons name="car-outline" size={24} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalItemName}>{item.marca} {item.modelo} {item.ano}</Text>
                      <Text style={styles.modalItemSub}>{item.placa} • {item.cor}</Text>
                    </View>
                    {form.veiculoId === item.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ── Modal Pagamento ── */}
      <Modal visible={pagModal} transparent animationType="slide" onRequestClose={() => setPagModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '50%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Forma de Pagamento</Text>
              <TouchableOpacity onPress={() => setPagModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {FORMAS_PAGAMENTO.map(fp => (
              <TouchableOpacity key={fp} style={styles.modalItem} onPress={() => { set('formaPagamento', fp); setPagModal(false); }}>
                <Text style={styles.modalItemName}>{fp}</Text>
                {form.formaPagamento === fp && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── Modal Estoque ── */}
      <Modal visible={estoqueModal} transparent animationType="slide" onRequestClose={() => setEstoqueModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar do Estoque</Text>
              <TouchableOpacity onPress={() => setEstoqueModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalSearch}
              placeholder="Buscar peça..."
              placeholderTextColor={colors.textMuted}
              value={searchEstoque}
              onChangeText={setSearchEstoque}
            />
            <FlatList
              data={estoqueFiltrado}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const semEstoque = (parseInt(item.quantidade, 10) || 0) <= 0;

                return (
                  <TouchableOpacity
                    style={[styles.modalItem, semEstoque && styles.modalItemDisabled]}
                    onPress={() => !semEstoque && addPecaDoEstoque(item)}
                    disabled={semEstoque}
                  >
                    <Ionicons name="cube-outline" size={22} color={semEstoque ? colors.textMuted : colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalItemName, semEstoque && styles.modalItemNameDisabled]}>{item.nome}</Text>
                      <Text style={styles.modalItemSub}>
                        {item.codigo ? `${item.codigo} • ` : ''}Estoque: {item.quantidade} • Venda: {formatCurrency(item.valorVenda)}
                      </Text>
                    </View>
                    {semEstoque ? <Text style={styles.stockUnavailable}>Sem estoque</Text> : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyTxt}>Nenhuma peça encontrada</Text>}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  sectionBox: { marginBottom: 16, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  selector: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    padding: 14, minHeight: 50,
  },
  selectorError: { borderColor: colors.danger },
  selectorTxt: { flex: 1, color: colors.text, fontSize: 15 },
  selectorPlaceholder: { color: colors.textMuted },
  errTxt: { color: colors.danger, fontSize: 12, marginTop: 4 },
  fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnTxt: { color: colors.black, fontWeight: '700', fontSize: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
  removeBtn: { padding: 8, marginTop: 6 },
  rowTwo: { flexDirection: 'row', alignItems: 'center' },
  subtotalRow: { marginTop: 4 },
  subtotalTxt: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  emptyTxt: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  totalLineLabel: { color: colors.textSecondary, fontSize: 14 },
  totalLineVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
  totalFinalLine: { backgroundColor: colors.primary + '15', borderRadius: 8, paddingHorizontal: 10, marginVertical: 8, borderBottomWidth: 0 },
  totalFinalLabel: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  totalFinalVal: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', borderWidth: 1, borderColor: colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalSearch: { margin: 16, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 14, height: 44, color: colors.text, borderWidth: 1, borderColor: colors.border },
  modalItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemDisabled: { opacity: 0.55 },
  modalAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '22', justifyContent: 'center', alignItems: 'center' },
  modalAvatarTxt: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  modalItemName: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  modalItemNameDisabled: { color: colors.textSecondary },
  modalItemSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  stockUnavailable: { color: colors.warning, fontSize: 11, fontWeight: '700' },
});
