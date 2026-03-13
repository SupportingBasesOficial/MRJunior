import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

const CATEGORIAS_RECEITA = ['Serviço', 'Venda de Peça', 'Mão de Obra', 'Revisão', 'Outros'];
const CATEGORIAS_DESPESA = ['Peças', 'Aluguel', 'Energia', 'Água', 'Salário', 'Ferramentas', 'Material', 'Manutenção', 'Outros'];
const FORMAS = ['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Transferência', 'Cheque'];

export default function LancamentoFormScreen({ navigation }) {
  const { addLancamento } = useApp();
  const [tipo, setTipo] = useState('receita');
  const [form, setForm] = useState({ descricao: '', valor: '', categoria: '', formaPagamento: 'PIX', status: 'pago' });
  const [catModal, setCatModal] = useState(false);
  const [pagModal, setPagModal] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const err = {};
    if (!form.descricao.trim()) err.descricao = 'Descrição é obrigatória';
    if (!form.valor || parseFloat(form.valor) <= 0) err.valor = 'Valor inválido';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addLancamento({ ...form, tipo, data: new Date().toISOString(), valor: parseFloat(String(form.valor).replace(',', '.')) });
    Alert.alert('Sucesso', 'Lançamento adicionado!');
    navigation.goBack();
  };

  const cats = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Tipo */}
          <Text style={styles.fieldLabel}>Tipo</Text>
          <View style={styles.tipoRow}>
            <TouchableOpacity style={[styles.tipoBtn, tipo === 'receita' && styles.tipoBtnReceita]} onPress={() => setTipo('receita')}>
              <Ionicons name="arrow-up-circle-outline" size={20} color={tipo === 'receita' ? colors.black : colors.success} />
              <Text style={[styles.tipoTxt, tipo === 'receita' && { color: colors.black }]}>Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tipoBtn, tipo === 'despesa' && styles.tipoBtnDespesa]} onPress={() => setTipo('despesa')}>
              <Ionicons name="arrow-down-circle-outline" size={20} color={tipo === 'despesa' ? colors.white : colors.danger} />
              <Text style={[styles.tipoTxt, tipo === 'despesa' && { color: colors.white }]}>Despesa</Text>
            </TouchableOpacity>
          </View>

          <Input label="Descrição *" value={form.descricao} onChangeText={v => set('descricao', v)}
            placeholder="Ex: OS-0001, Compra de filtros..." error={errors.descricao} autoCapitalize="sentences" />

          <Input label="Valor (R$) *" value={form.valor} onChangeText={v => set('valor', v)}
            placeholder="0,00" keyboardType="decimal-pad" error={errors.valor} />

          <Text style={styles.fieldLabel}>Categoria</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setCatModal(true)}>
            <Ionicons name="pricetag-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.selectorTxt, !form.categoria && { color: colors.textMuted }]}>
              {form.categoria || 'Selecionar categoria...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Forma de Pagamento</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setPagModal(true)}>
            <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.selectorTxt}>{form.formaPagamento}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Status</Text>
          <View style={styles.tipoRow}>
            <TouchableOpacity style={[styles.tipoBtn, form.status === 'pago' && styles.tipoBtnReceita]} onPress={() => set('status', 'pago')}>
              <Text style={[styles.tipoTxt, form.status === 'pago' && { color: colors.black }]}>✓ Pago</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tipoBtn, form.status === 'pendente' && { backgroundColor: colors.warning }]} onPress={() => set('status', 'pendente')}>
              <Text style={[styles.tipoTxt, form.status === 'pendente' && { color: colors.black }]}>⏳ Pendente</Text>
            </TouchableOpacity>
          </View>

          <Button title="Salvar Lançamento" onPress={handleSave} style={{ marginTop: 16 }} />
          <Button title="Cancelar" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={catModal} transparent animationType="slide" onRequestClose={() => setCatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categoria</Text>
              <TouchableOpacity onPress={() => setCatModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            {cats.map(c => (
              <TouchableOpacity key={c} style={styles.modalItem} onPress={() => { set('categoria', c); setCatModal(false); }}>
                <Text style={styles.modalItemTxt}>{c}</Text>
                {form.categoria === c && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={pagModal} transparent animationType="slide" onRequestClose={() => setPagModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Forma de Pagamento</Text>
              <TouchableOpacity onPress={() => setPagModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            {FORMAS.map(f => (
              <TouchableOpacity key={f} style={styles.modalItem} onPress={() => { set('formaPagamento', f); setPagModal(false); }}>
                <Text style={styles.modalItemTxt}>{f}</Text>
                {form.formaPagamento === f && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  tipoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  tipoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingVertical: 14 },
  tipoBtnReceita: { backgroundColor: colors.success, borderColor: colors.success },
  tipoBtnDespesa: { backgroundColor: colors.danger, borderColor: colors.danger },
  tipoTxt: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  selector: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 50 },
  selectorTxt: { flex: 1, color: colors.text, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemTxt: { color: colors.text, fontSize: 15 },
});
