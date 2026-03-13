import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

const CATEGORIAS = ['Motor', 'Freios', 'Suspensão', 'Elétrico', 'Filtros', 'Fluidos', 'Carroceria', 'Outros'];

export default function PecaFormScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { addPeca, updatePeca, getPeca } = useApp();

  const [form, setForm] = useState({
    codigo: '', nome: '', descricao: '', categoria: '',
    quantidade: '0', quantidadeMinima: '2',
    valorCusto: '', valorVenda: '', fornecedor: '', localizacao: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      const p = getPeca(id);
      if (p) setForm({
        codigo: p.codigo || '', nome: p.nome || '', descricao: p.descricao || '',
        categoria: p.categoria || '', quantidade: String(p.quantidade || 0),
        quantidadeMinima: String(p.quantidadeMinima || 2),
        valorCusto: String(p.valorCusto || ''), valorVenda: String(p.valorVenda || ''),
        fornecedor: p.fornecedor || '', localizacao: p.localizacao || '',
      });
    }
  }, [id]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const err = {};
    if (!form.nome.trim()) err.nome = 'Nome é obrigatório';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const normalizeDecimal = (v) => String(parseFloat(String(v).replace(',', '.')) || 0);

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      ...form,
      valorCusto: normalizeDecimal(form.valorCusto),
      valorVenda: normalizeDecimal(form.valorVenda),
    };
    if (id) {
      updatePeca(id, data);
      Alert.alert('Sucesso', 'Peça atualizada!');
    } else {
      addPeca(data);
      Alert.alert('Sucesso', 'Peça cadastrada!');
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Input label="Código / SKU" value={form.codigo} onChangeText={v => set('codigo', v)}
          placeholder="Ex: FIL-001" autoCapitalize="characters" />

        <Input label="Nome da Peça *" value={form.nome} onChangeText={v => set('nome', v)}
          placeholder="Ex: Filtro de óleo, Pastilha de freio..." error={errors.nome} autoCapitalize="words" />

        <Input label="Descrição" value={form.descricao} onChangeText={v => set('descricao', v)}
          placeholder="Descrição detalhada..." multiline numberOfLines={3}
          style={{ minHeight: 70, textAlignVertical: 'top' }} />

        <Input label="Categoria" value={form.categoria} onChangeText={v => set('categoria', v)}
          placeholder="Motor, Freios, Suspensão..." autoCapitalize="words" />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Qtd. Atual" value={form.quantidade} onChangeText={v => set('quantidade', v)}
              placeholder="0" keyboardType="numeric" containerStyle={{ marginBottom: 0 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Qtd. Mínima" value={form.quantidadeMinima} onChangeText={v => set('quantidadeMinima', v)}
              placeholder="2" keyboardType="numeric" containerStyle={{ marginBottom: 0 }} />
          </View>
        </View>

        <View style={[styles.row, { marginTop: 14 }]}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Valor de Custo (R$)" value={form.valorCusto} onChangeText={v => set('valorCusto', v)}
              placeholder="0,00" keyboardType="decimal-pad" containerStyle={{ marginBottom: 0 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Valor de Venda (R$)" value={form.valorVenda} onChangeText={v => set('valorVenda', v)}
              placeholder="0,00" keyboardType="decimal-pad" containerStyle={{ marginBottom: 0 }} />
          </View>
        </View>

        <Input label="Fornecedor" value={form.fornecedor} onChangeText={v => set('fornecedor', v)}
          placeholder="Nome do fornecedor" autoCapitalize="words" containerStyle={{ marginTop: 14 }} />

        <Input label="Localização / Prateleira" value={form.localizacao} onChangeText={v => set('localizacao', v)}
          placeholder="Ex: Estante A, Gaveta 3..." autoCapitalize="characters" />

        <Button title={id ? 'Salvar Alterações' : 'Cadastrar Peça'} onPress={handleSave} style={{ marginTop: 8 }} />
        <Button title="Cancelar" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  row: { flexDirection: 'row' },
});
