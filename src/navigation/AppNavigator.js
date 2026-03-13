import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

import ClientesScreen from '../screens/clientes/ClientesScreen';
import ClienteDetailScreen from '../screens/clientes/ClienteDetailScreen';
import ClienteFormScreen from '../screens/clientes/ClienteFormScreen';
import VeiculoFormScreen from '../screens/veiculos/VeiculoFormScreen';
import VeiculoDetailScreen from '../screens/veiculos/VeiculoDetailScreen';

import OrdensScreen from '../screens/ordens/OrdensScreen';
import OrdemDetailScreen from '../screens/ordens/OrdemDetailScreen';
import OrdemFormScreen from '../screens/ordens/OrdemFormScreen';

import EstoqueScreen from '../screens/estoque/EstoqueScreen';
import PecaFormScreen from '../screens/estoque/PecaFormScreen';

import FinanceiroScreen from '../screens/financeiro/FinanceiroScreen';
import LancamentoFormScreen from '../screens/financeiro/LancamentoFormScreen';
import AgendaScreen from '../screens/agenda/AgendaScreen';
import AgendaFormScreen from '../screens/agenda/AgendaFormScreen';
import MaisScreen from '../screens/mais/MaisScreen';
import ConfigScreen from '../screens/config/ConfigScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOpts = {
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '800' },
  contentStyle: { backgroundColor: colors.background },
};

function ClientesStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="ClientesList" component={ClientesScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="ClienteDetail" component={ClienteDetailScreen} options={{ title: 'Cliente' }} />
      <Stack.Screen name="ClienteForm" component={ClienteFormScreen}
        options={({ route }) => ({ title: route.params?.id ? 'Editar Cliente' : 'Novo Cliente' })} />
      <Stack.Screen name="VeiculoForm" component={VeiculoFormScreen}
        options={({ route }) => ({ title: route.params?.id ? 'Editar Veículo' : 'Novo Veículo' })} />
      <Stack.Screen name="VeiculoDetail" component={VeiculoDetailScreen} options={{ title: 'Veículo' }} />
    </Stack.Navigator>
  );
}

function OrdensStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="OrdensList" component={OrdensScreen} options={{ title: 'Ordens de Serviço' }} />
      <Stack.Screen name="OrdemDetail" component={OrdemDetailScreen} options={{ title: 'Ordem de Serviço' }} />
      <Stack.Screen name="OrdemForm" component={OrdemFormScreen}
        options={({ route }) => ({ title: route.params?.id ? 'Editar OS' : 'Nova OS' })} />
    </Stack.Navigator>
  );
}

function EstoqueStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="EstoqueList" component={EstoqueScreen} options={{ title: 'Estoque' }} />
      <Stack.Screen name="PecaForm" component={PecaFormScreen}
        options={({ route }) => ({ title: route.params?.id ? 'Editar Peça' : 'Nova Peça' })} />
    </Stack.Navigator>
  );
}

function MaisStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="MaisList" component={MaisScreen} options={{ title: 'Mais' }} />
      <Stack.Screen name="Financeiro" component={FinanceiroScreen} options={{ title: 'Financeiro' }} />
      <Stack.Screen name="LancamentoForm" component={LancamentoFormScreen} options={{ title: 'Novo Lançamento' }} />
      <Stack.Screen name="Agenda" component={AgendaScreen} options={{ title: 'Agenda' }} />
      <Stack.Screen name="AgendaForm" component={AgendaFormScreen}
        options={({ route }) => ({ title: route.params?.id ? 'Editar Agendamento' : 'Novo Agendamento' })} />
      <Stack.Screen name="Config" component={ConfigScreen} options={{ title: 'Configurações' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'speedometer' : 'speedometer-outline',
            Ordens: focused ? 'document-text' : 'document-text-outline',
            Clientes: focused ? 'people' : 'people-outline',
            Estoque: focused ? 'cube' : 'cube-outline',
            Mais: focused ? 'grid' : 'grid-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Ordens" component={OrdensStack} options={{ title: 'OS' }} />
      <Tab.Screen name="Clientes" component={ClientesStack} options={{ title: 'Clientes' }} />
      <Tab.Screen name="Estoque" component={EstoqueStack} options={{ title: 'Estoque' }} />
      <Tab.Screen name="Mais" component={MaisStack} options={{ title: 'Mais' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
