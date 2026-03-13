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

const MARCAS = ['Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Mitsubishi', 'Nissan',
  'Peugeot', 'Renault', 'Toyota', 'Volkswagen', 'Outro'];
const COMBUSTIVEIS = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Elétrico', 'Híbrido'];

export default function VeiculoFormScreen({ route, navigation }) {
  const { id, clienteId } = route.params || {};
  const { addVeiculo, updateVeiculo, getVeiculo, clientes } = useApp();

  const [form, setForm] = useState({
    clienteId: clienteId || '', marca: '', modelo: '', ano: '',
    placa: '', cor: '', km: '', combustivel: '', motor: '', chassi: '', observacoes: '',
  });
  const [errors, setErrors] = useState({});
  const [marcaModal, setMarcaModal] = useState(false);
  const [combustivelModal, setCombustivelModal] = useState(false);

  useEffect(() => {
    if (id) {
      const v = getVeiculo(id);
      if (v) setForm({
        clienteId: v.clienteId || '', marca: v.marca || '', modelo: v.modelo || '',
        ano: v.ano || '', placa: v.placa || '', cor: v.cor || '',
        km: v.km || '', combustivel: v.combustivel || '', motor: v.motor || '',
        chassi: v.chassi || '', observacoes: v.observacoes || '',
      });
    }
  }, [id]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const err = {};
    if (!form.marca.trim()) err.marca = 'Marca é obrigatória';
    if (!form.modelo.trim()) err.modelo = 'Modelo é obrigatório';
    if (!form.placa.trim()) err.placa = 'Placa é obrigatória';
    if (!form.clienteId) err.clienteId = 'Selecione o proprietário';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = { ...form, placa: form.placa.toUpperCase() };
    if (id) {
      updateVeiculo(id, data);
      Alert.alert('Sucesso', 'Veículo atualizado!');
    } else {
      addVeiculo(data);
      Alert.alert('Sucesso', 'Veículo cadastrado!');
    }
    navigation.goBack();
  };

  const cliente = clientes.find(c => c.id === form.clienteId);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {!clienteId && (
          <Input label="Proprietário *" value={cliente?.nome || ''} editable={false}
            placeholder="Proprietário não definido" error={errors.clienteId} />
        )}
        {cliente && <Text style={styles.ownerBadge}>👤 {cliente.nome}</Text>}

        <Text style={styles.fieldLabel}>Marca *</Text>
        <TouchableOpacity style={[styles.selector, errors.marca && styles.selectorError]} onPress={() => setMarcaModal(true)}>
          <Ionicons name="car-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.selectorTxt, !form.marca && styles.selectorPlaceholder]}>
            {form.marca || 'Selecionar marca...'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>
        {errors.marca ? <Text style={styles.errTxt}>{errors.marca}</Text> : null}

        <Input label="Modelo *" value={form.modelo} onChangeText={v => set('modelo', v)}
          placeholder="Ex: Corolla, Civic, Uno..." error={errors.modelo} autoCapitalize="words" />

        <Input label="Ano" value={form.ano} onChangeText={v => set('ano', v)}
          placeholder="Ex: 2022" keyboardType="numeric" maxLength={4} />

        <Input label="Placa *" value={form.placa} onChangeText={v => set('placa', v.toUpperCase())}
          placeholder="ABC-1234 ou ABC1D23" autoCapitalize="characters" error={errors.placa} maxLength={8} />

        <Input label="Cor" value={form.cor} onChangeText={v => set('cor', v)}
          placeholder="Ex: Preto, Branco, Prata..." autoCapitalize="words" />

        <Input label="KM Atual" value={form.km} onChangeText={v => set('km', v)}
          placeholder="Ex: 85000" keyboardType="numeric" />

        <Text style={styles.fieldLabel}>Combustível</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setCombustivelModal(true)}>
          <Ionicons name="flame-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.selectorTxt, !form.combustivel && styles.selectorPlaceholder]}>
            {form.combustivel || 'Selecionar combustível...'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <Input label="Motor" value={form.motor} onChangeText={v => set('motor', v)}
          placeholder="Ex: 1.0, 2.0 Turbo, V8..." />

        <Input label="Chassi" value={form.chassi} onChangeText={v => set('chassi', v.toUpperCase())}
          placeholder="Número do chassi" autoCapitalize="characters" />

        <Input label="Observações" value={form.observacoes} onChangeText={v => set('observacoes', v)}
          placeholder="Anotações sobre o veículo..." multiline numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }} />

        <Button title={id ? 'Salvar Alterações' : 'Cadastrar Veículo'} onPress={handleSave} style={{ marginTop: 8 }} />
        <Button title="Cancelar" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={marcaModal} transparent animationType="slide" onRequestClose={() => setMarcaModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Marca do Veículo</Text>
              <TouchableOpacity onPress={() => setMarcaModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList
              data={MARCAS}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { set('marca', item); setMarcaModal(false); }}>
                  <Text style={styles.modalItemTxt}>{item}</Text>
                  {form.marca === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={combustivelModal} transparent animationType="slide" onRequestClose={() => setCombustivelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Combustível</Text>
              <TouchableOpacity onPress={() => setCombustivelModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList
              data={COMBUSTIVEIS}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { set('combustivel', item); setCombustivelModal(false); }}>
                  <Text style={styles.modalItemTxt}>{item}</Text>
                  {form.combustivel === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  ownerBadge: {
    color: colors.primary, fontSize: 14, fontWeight: '700',
    backgroundColor: colors.primary + '15', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14,
  },
  fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  selector: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    padding: 14, minHeight: 50, marginBottom: 4,
  },
  selectorError: { borderColor: colors.danger },
  selectorTxt: { flex: 1, color: colors.text, fontSize: 15 },
  selectorPlaceholder: { color: colors.textMuted },
  errTxt: { color: colors.danger, fontSize: 12, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '70%', borderWidth: 1, borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalItemTxt: { color: colors.text, fontSize: 15 },
});
