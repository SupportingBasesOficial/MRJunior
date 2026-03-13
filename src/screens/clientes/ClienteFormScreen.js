import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ClienteFormScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { addCliente, updateCliente, getCliente } = useApp();

  const [form, setForm] = useState({
    nome: '', celular: '', telefone: '', email: '',
    cpf: '', endereco: '', cidade: '', observacoes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      const c = getCliente(id);
      if (c) setForm({
        nome: c.nome || '', celular: c.celular || '', telefone: c.telefone || '',
        email: c.email || '', cpf: c.cpf || '', endereco: c.endereco || '',
        cidade: c.cidade || '', observacoes: c.observacoes || '',
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
    if (!form.celular.trim() && !form.telefone.trim()) err.celular = 'Informe ao menos um telefone';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (id) {
      updateCliente(id, form);
      Alert.alert('Sucesso', 'Cliente atualizado!');
    } else {
      addCliente(form);
      Alert.alert('Sucesso', 'Cliente cadastrado!');
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Input label="Nome *" value={form.nome} onChangeText={v => set('nome', v)}
          placeholder="Nome completo" error={errors.nome} autoCapitalize="words" />

        <Input label="Celular *" value={form.celular} onChangeText={v => set('celular', v)}
          placeholder="(11) 99999-9999" keyboardType="phone-pad" error={errors.celular} />

        <Input label="Telefone" value={form.telefone} onChangeText={v => set('telefone', v)}
          placeholder="(11) 1234-5678" keyboardType="phone-pad" />

        <Input label="E-mail" value={form.email} onChangeText={v => set('email', v)}
          placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />

        <Input label="CPF / CNPJ" value={form.cpf} onChangeText={v => set('cpf', v)}
          placeholder="000.000.000-00" keyboardType="numeric" />

        <Input label="Endereço" value={form.endereco} onChangeText={v => set('endereco', v)}
          placeholder="Rua, número, bairro" autoCapitalize="words" />

        <Input label="Cidade" value={form.cidade} onChangeText={v => set('cidade', v)}
          placeholder="Cidade" autoCapitalize="words" />

        <Input label="Observações" value={form.observacoes} onChangeText={v => set('observacoes', v)}
          placeholder="Anotações sobre o cliente..." multiline numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: 'top' }} />

        <Button title={id ? 'Salvar Alterações' : 'Cadastrar Cliente'} onPress={handleSave} style={{ marginTop: 8 }} />
        <Button title="Cancelar" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
});
