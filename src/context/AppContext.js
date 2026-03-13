import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { KEYS, storageGet, storageSet } from '../utils/storage';
import { generateId, generateOSNumber, calcOrdemTotal } from '../utils/helpers';

const AppContext = createContext();

const initialState = {
  isLoading: true,
  user: null,
  clientes: [],
  veiculos: [],
  ordens: [],
  estoque: [],
  financeiro: [],
  agendamentos: [],
  osCounter: 1,
};

const syncOrdemFromLancamentos = (ordens, financeiro, osId) => {
  if (!osId) return ordens;

  const linkedLancamentos = financeiro.filter(lancamento => lancamento.osId === osId);
  const hasLinkedLancamento = linkedLancamentos.length > 0;
  const hasPaidLancamento = linkedLancamentos.some(lancamento => lancamento.status === 'pago');
  const paidLancamento = linkedLancamentos.find(lancamento => lancamento.status === 'pago');

  return ordens.map(ordem => {
    if (ordem.id !== osId) return ordem;

    return {
      ...ordem,
      lancamentoGerado: hasLinkedLancamento,
      pago: hasPaidLancamento,
      valorPago: hasPaidLancamento ? (parseFloat(paidLancamento?.valor) || parseFloat(ordem.valorFinal) || 0) : 0,
      updatedAt: new Date().toISOString(),
    };
  });
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false };

    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
    case 'UPDATE_CLIENTE':
      return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CLIENTE': {
      const veiculoIds = state.veiculos
        .filter(v => v.clienteId === action.payload)
        .map(v => v.id);
      const ordensRemovidasIds = state.ordens
        .filter(o => o.clienteId === action.payload || veiculoIds.includes(o.veiculoId))
        .map(o => o.id);

      return {
        ...state,
        clientes: state.clientes.filter(c => c.id !== action.payload),
        veiculos: state.veiculos.filter(v => v.clienteId !== action.payload),
        ordens: state.ordens.filter(o => o.clienteId !== action.payload && !veiculoIds.includes(o.veiculoId)),
        financeiro: state.financeiro.filter(l => !ordensRemovidasIds.includes(l.osId)),
        agendamentos: state.agendamentos.filter(a => a.clienteId !== action.payload && !veiculoIds.includes(a.veiculoId)),
      };
    }

    case 'ADD_VEICULO':
      return { ...state, veiculos: [...state.veiculos, action.payload] };
    case 'UPDATE_VEICULO':
      return { ...state, veiculos: state.veiculos.map(v => v.id === action.payload.id ? action.payload : v) };
    case 'DELETE_VEICULO': {
      const ordensRemovidasIds = state.ordens
        .filter(o => o.veiculoId === action.payload)
        .map(o => o.id);

      return {
        ...state,
        veiculos: state.veiculos.filter(v => v.id !== action.payload),
        ordens: state.ordens.filter(o => o.veiculoId !== action.payload),
        financeiro: state.financeiro.filter(l => !ordensRemovidasIds.includes(l.osId)),
        agendamentos: state.agendamentos.filter(a => a.veiculoId !== action.payload),
      };
    }

    case 'ADD_ORDEM':
      return { ...state, ordens: [...state.ordens, action.payload], osCounter: state.osCounter + 1 };
    case 'UPDATE_ORDEM':
      return { ...state, ordens: state.ordens.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'DELETE_ORDEM':
      return {
        ...state,
        ordens: state.ordens.filter(o => o.id !== action.payload),
        financeiro: state.financeiro.filter(l => l.osId !== action.payload),
      };

    case 'ADD_PECA':
      return { ...state, estoque: [...state.estoque, action.payload] };
    case 'UPDATE_PECA':
      return { ...state, estoque: state.estoque.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PECA':
      return { ...state, estoque: state.estoque.filter(p => p.id !== action.payload) };

    case 'ADD_LANCAMENTO': {
      const financeiro = [...state.financeiro, action.payload];
      return {
        ...state,
        financeiro,
        ordens: syncOrdemFromLancamentos(state.ordens, financeiro, action.payload.osId),
      };
    }
    case 'UPDATE_LANCAMENTO': {
      const financeiro = state.financeiro.map(l => l.id === action.payload.id ? action.payload : l);
      return {
        ...state,
        financeiro,
        ordens: syncOrdemFromLancamentos(state.ordens, financeiro, action.payload.osId),
      };
    }
    case 'DELETE_LANCAMENTO': {
      const deletedLancamento = state.financeiro.find(l => l.id === action.payload);
      const financeiro = state.financeiro.filter(l => l.id !== action.payload);
      return {
        ...state,
        financeiro,
        ordens: syncOrdemFromLancamentos(state.ordens, financeiro, deletedLancamento?.osId),
      };
    }

    case 'ADD_AGENDAMENTO':
      return { ...state, agendamentos: [...state.agendamentos, action.payload] };
    case 'UPDATE_AGENDAMENTO':
      return { ...state, agendamentos: state.agendamentos.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_AGENDAMENTO':
      return { ...state, agendamentos: state.agendamentos.filter(a => a.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      storageSet(KEYS.CLIENTES, state.clientes);
      storageSet(KEYS.VEICULOS, state.veiculos);
      storageSet(KEYS.ORDENS, state.ordens);
      storageSet(KEYS.ESTOQUE, state.estoque);
      storageSet(KEYS.FINANCEIRO, state.financeiro);
      storageSet(KEYS.AGENDAMENTOS, state.agendamentos);
      storageSet(KEYS.OS_COUNTER, state.osCounter);
    }
  }, [state.clientes, state.veiculos, state.ordens, state.estoque, state.financeiro, state.agendamentos, state.osCounter]);

  const loadInitialData = async () => {
    const [clientes, veiculos, ordens, estoque, financeiro, agendamentos, osCounter] =
      await Promise.all([
        storageGet(KEYS.CLIENTES),
        storageGet(KEYS.VEICULOS),
        storageGet(KEYS.ORDENS),
        storageGet(KEYS.ESTOQUE),
        storageGet(KEYS.FINANCEIRO),
        storageGet(KEYS.AGENDAMENTOS),
        storageGet(KEYS.OS_COUNTER),
      ]);
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        clientes: clientes || [],
        veiculos: veiculos || [],
        ordens: ordens || [],
        estoque: estoque || [],
        financeiro: financeiro || [],
        agendamentos: agendamentos || [],
        osCounter: osCounter || 1,
      },
    });
  };

  // ─── Auth ────────────────────────────────────────────────────────────────
  const login = (username, password) => {
    if (username === 'admin' && password === 'admin') {
      dispatch({ type: 'SET_USER', payload: { username: 'admin', role: 'admin', nome: 'Administrador' } });
      return true;
    }
    return false;
  };
  const logout = () => dispatch({ type: 'SET_USER', payload: null });

  // ─── Clientes ────────────────────────────────────────────────────────────
  const addCliente = (data) => {
    const cliente = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_CLIENTE', payload: cliente });
    return cliente;
  };
  const updateCliente = (id, data) => {
    const updated = { ...data, id, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CLIENTE', payload: updated });
    return updated;
  };
  const deleteCliente = (id) => dispatch({ type: 'DELETE_CLIENTE', payload: id });
  const getCliente = (id) => state.clientes.find(c => c.id === id);

  // ─── Veículos ────────────────────────────────────────────────────────────
  const addVeiculo = (data) => {
    const veiculo = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_VEICULO', payload: veiculo });
    return veiculo;
  };
  const updateVeiculo = (id, data) => {
    const updated = { ...data, id, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_VEICULO', payload: updated });
    return updated;
  };
  const deleteVeiculo = (id) => dispatch({ type: 'DELETE_VEICULO', payload: id });
  const getVeiculo = (id) => state.veiculos.find(v => v.id === id);
  const getVeiculosByCliente = (clienteId) => state.veiculos.filter(v => v.clienteId === clienteId);

  // ─── Ordens de Serviço ───────────────────────────────────────────────────
  const addOrdem = (data) => {
    const numero = generateOSNumber(state.osCounter);
    const total = calcOrdemTotal(data.servicos, data.pecas);
    const ordem = {
      ...data,
      id: generateId(),
      numero,
      status: 'aberta',
      valorTotal: total,
      valorFinal: total - (parseFloat(data.desconto) || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ORDEM', payload: ordem });
    return ordem;
  };
  const updateOrdem = (id, data) => {
    const current = state.ordens.find(o => o.id === id);
    const merged = { ...current, ...data, id };
    const total = calcOrdemTotal(merged.servicos, merged.pecas);
    const desconto = parseFloat(merged.desconto) || 0;
    const updated = {
      ...merged,
      valorTotal: total,
      valorFinal: total - desconto,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_ORDEM', payload: updated });
    return updated;
  };
  const deleteOrdem = (id) => dispatch({ type: 'DELETE_ORDEM', payload: id });
  const getOrdem = (id) => state.ordens.find(o => o.id === id);

  // ─── Estoque ─────────────────────────────────────────────────────────────
  const addPeca = (data) => {
    const peca = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_PECA', payload: peca });
    return peca;
  };
  const updatePeca = (id, data) => {
    const updated = { ...data, id, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PECA', payload: updated });
    return updated;
  };
  const deletePeca = (id) => dispatch({ type: 'DELETE_PECA', payload: id });
  const getPeca = (id) => state.estoque.find(p => p.id === id);

  // ─── Financeiro ──────────────────────────────────────────────────────────
  const addLancamento = (data) => {
    const lancamento = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_LANCAMENTO', payload: lancamento });
    return lancamento;
  };
  const updateLancamento = (id, data) => {
    const updated = { ...data, id };
    dispatch({ type: 'UPDATE_LANCAMENTO', payload: updated });
    return updated;
  };
  const deleteLancamento = (id) => dispatch({ type: 'DELETE_LANCAMENTO', payload: id });

  // ─── Agendamentos ────────────────────────────────────────────────────────
  const addAgendamento = (data) => {
    const ag = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_AGENDAMENTO', payload: ag });
    return ag;
  };
  const updateAgendamento = (id, data) => {
    const current = state.agendamentos.find(a => a.id === id);
    const updated = { ...current, ...data, id };
    dispatch({ type: 'UPDATE_AGENDAMENTO', payload: updated });
    return updated;
  };
  const deleteAgendamento = (id) => dispatch({ type: 'DELETE_AGENDAMENTO', payload: id });

  const value = {
    ...state,
    login, logout,
    addCliente, updateCliente, deleteCliente, getCliente,
    addVeiculo, updateVeiculo, deleteVeiculo, getVeiculo, getVeiculosByCliente,
    addOrdem, updateOrdem, deleteOrdem, getOrdem,
    addPeca, updatePeca, deletePeca, getPeca,
    addLancamento, updateLancamento, deleteLancamento,
    addAgendamento, updateAgendamento, deleteAgendamento,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
