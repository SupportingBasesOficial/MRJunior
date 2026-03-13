import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import EmptyState from '../../components/EmptyState';

export default function ClientesScreen({ navigation }) {
  const { clientes, deleteCliente, veiculos } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    clientes.filter(c =>
      c.nome?.toLowerCase().includes(search.toLowerCase()) ||
      c.telefone?.includes(search) ||
      c.cpf?.includes(search)
    ).sort((a, b) => a.nome?.localeCompare(b.nome)),
    [clientes, search]
  );

  const confirmDelete = (id, nome) => {
    Alert.alert('Excluir Cliente', `Deseja excluir "${nome}"?\nVeículos, ordens de serviço, agendamentos e lançamentos vinculados serão excluídos.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteCliente(id) },
    ]);
  };

  const renderItem = ({ item }) => {
    const numVeiculos = veiculos.filter(v => v.clienteId === item.id).length;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ClienteDetail', { id: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nome?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.tel}>{item.celular || item.telefone || 'Sem telefone'}</Text>
          <Text style={styles.veics}>{numVeiculos} veículo{numVeiculos !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate('ClienteForm', { id: item.id })} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(item.id, item.nome)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, telefone ou CPF..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title="Nenhum cliente encontrado"
            subtitle={search ? 'Tente outra busca' : 'Toque no + para adicionar'} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ClienteForm')}>
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchRow: { padding: 16, paddingBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  card: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', padding: 14,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primary + '22', borderWidth: 1.5, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatarText: { color: colors.primary, fontSize: 20, fontWeight: '800' },
  info: { flex: 1 },
  nome: { color: colors.text, fontSize: 15, fontWeight: '700' },
  tel: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  veics: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 8,
  },
});
