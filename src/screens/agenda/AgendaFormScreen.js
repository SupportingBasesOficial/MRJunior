import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform,
  Text, TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

const HORAS = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

export default function AgendaFormScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { addAgendamento, updateAgendamento, agendamentos, clientes, veiculos, getVeiculosByCliente } = useApp();

  const [form, setForm] = useState({
    clienteId: '', veiculoId: '',
    data: new Date().toISOString().slice(0, 10),
    hora: '09:00', servico: '', observacoes: '', status: 'agendado',
  });
  const [clienteModal, setClienteModal] = useState(false);
  const [veiculoModal, setVeiculoModal] = useState(false);
  const [horaModal, setHoraModal] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      const ag = agendamentos.find(a => a.id === id);
      if (ag) setForm({
        clienteId: ag.clienteId || '', veiculoId: ag.veiculoId || '',
        data: ag.data ? ag.data.slice(0, 10) : '', hora: ag.hora || '09:00',
        servico: ag.servico || '', observacoes: ag.observacoes || '', status: ag.status || 'agendado',
      });
    }
  }, [id]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };
  const clienteAtual = clientes.find(c => c.id === form.clienteId);
  const veiculoAtual = veiculos.find(v => v.id === form.veiculoId);
  const veiculosDoCliente = getVeiculosByCliente(form.clienteId);
  const clientesFiltrados = clientes.filter(c => !searchCliente || c.nome.toLowerCase().includes(searchCliente.toLowerCase()));

  const isValidDate = (value) => {
    if (!value) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.toISOString().slice(0, 10) === value;
  };

  const validate = () => {
    const err = {};
    if (!form.clienteId) err.clienteId = 'Selecione o cliente';
    if (!isValidDate(form.data)) err.data = 'Data inválida. Use o formato AAAA-MM-DD';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = { ...form, data: new Date(`${form.data}T00:00:00`).toISOString() };
    if (id) {
      updateAgendamento(id, data);
      Alert.alert('Sucesso', 'Agendamento atualizado!');
    } else {
      addAgendamento(data);
      Alert.alert('Sucesso', 'Agendamento criado!');
    }
    navigation.goBack();
  };

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <Text style={styles.fieldLabel}>Cliente *</Text>
          <TouchableOpacity style={[styles.selector, errors.clienteId && styles.selectorError]} onPress={() => setClienteModal(true)}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.selectorTxt, !clienteAtual && { color: colors.textMuted }]}>
              {clienteAtual ? clienteAtual.nome : 'Selecionar cliente...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          {errors.clienteId ? <Text style={styles.errTxt}>{errors.clienteId}</Text> : null}

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Veículo</Text>
          <TouchableOpacity style={styles.selector} onPress={() => {
            if (!form.clienteId) { Alert.alert('Atenção', 'Selecione o cliente primeiro.'); return; }
            setVeiculoModal(true);
          }}>
            <Ionicons name="car-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.selectorTxt, !veiculoAtual && { color: colors.textMuted }]}>
              {veiculoAtual ? `${veiculoAtual.marca} ${veiculoAtual.modelo} • ${veiculoAtual.placa}` : 'Selecionar veículo...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <Input label="Data *" value={form.data} onChangeText={v => set('data', v)}
            placeholder="AAAA-MM-DD" keyboardType="numeric" error={errors.data}
            containerStyle={{ marginTop: 14 }} />

          <Text style={styles.fieldLabel}>Horário</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setHoraModal(true)}>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.selectorTxt}>{form.hora}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <Input label="Serviço / Motivo" value={form.servico} onChangeText={v => set('servico', v)}
            placeholder="Ex: Revisão, Troca de óleo, Diagnóstico..." autoCapitalize="sentences"
            containerStyle={{ marginTop: 14 }} />

          <Input label="Observações" value={form.observacoes} onChangeText={v => set('observacoes', v)}
            placeholder="Informações adicionais..." multiline numberOfLines={3}
            style={{ minHeight: 70, textAlignVertical: 'top' }} />

          <Button title={id ? 'Salvar Alterações' : 'Criar Agendamento'} onPress={handleSave} style={{ marginTop: 8 }} />
          <Button title="Cancelar" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={clienteModal} transparent animationType="slide" onRequestClose={() => setClienteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Cliente</Text>
              <TouchableOpacity onPress={() => setClienteModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <Input value={searchCliente} onChangeText={setSearchCliente} placeholder="Buscar..." containerStyle={{ margin: 16, marginBottom: 8 }} />
            <FlatList
              data={clientesFiltrados}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { set('clienteId', item.id); set('veiculoId', ''); setClienteModal(false); setSearchCliente(''); }}>
                  <Text style={styles.modalItemTxt}>{item.nome}</Text>
                  {form.clienteId === item.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={veiculoModal} transparent animationType="slide" onRequestClose={() => setVeiculoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Veículo</Text>
              <TouchableOpacity onPress={() => setVeiculoModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList
              data={veiculosDoCliente}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { set('veiculoId', item.id); setVeiculoModal(false); }}>
                  <Text style={styles.modalItemTxt}>{item.marca} {item.modelo} • {item.placa}</Text>
                  {form.veiculoId === item.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyTxt}>Nenhum veículo cadastrado</Text>}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={horaModal} transparent animationType="slide" onRequestClose={() => setHoraModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Horário</Text>
              <TouchableOpacity onPress={() => setHoraModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList
              data={HORAS}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { set('hora', item); setHoraModal(false); }}>
                  <Text style={styles.modalItemTxt}>{item}</Text>
                  {form.hora === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
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
  selector: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 50, marginBottom: 4 },
  selectorError: { borderColor: colors.danger },
  selectorTxt: { flex: 1, color: colors.text, fontSize: 15 },
  errTxt: { color: colors.danger, fontSize: 12, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', borderWidth: 1, borderColor: colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemTxt: { color: colors.text, fontSize: 15 },
  emptyTxt: { color: colors.textMuted, padding: 20, textAlign: 'center' },
});
