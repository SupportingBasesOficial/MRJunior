import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  CLIENTES: '@mrjunior:clientes',
  VEICULOS: '@mrjunior:veiculos',
  ORDENS: '@mrjunior:ordens',
  ESTOQUE: '@mrjunior:estoque',
  FINANCEIRO: '@mrjunior:financeiro',
  AGENDAMENTOS: '@mrjunior:agendamentos',
  OS_COUNTER: '@mrjunior:os_counter',
};

export const storageGet = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const storageSet = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage set error:', e);
  }
};
