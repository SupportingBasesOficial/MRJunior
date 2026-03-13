import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha usuário e senha.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (!ok) Alert.alert('Acesso Negado', 'Usuário ou senha inválidos.');
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Logo ── */}
        <View style={styles.logoWrap}>
          <View style={styles.logoRing}>
            <Ionicons name="construct" size={54} color={colors.primary} />
          </View>
          <Text style={styles.brand}>MR JUNIOR</Text>
          <Text style={styles.tagline}>Mecânica & Preparação de Motores</Text>
          <View style={styles.divider} />
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Acessar Sistema</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Usuário</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Digite seu usuário"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Senha</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Text style={styles.btnText}>Entrando...</Text>
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color={colors.black} style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>ENTRAR</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2025 MR Junior — Todos os direitos reservados</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },

  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoRing: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.card, borderWidth: 2.5, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  brand: { fontSize: 38, fontWeight: '900', color: colors.primary, letterSpacing: 7 },
  tagline: { fontSize: 12, color: colors.textSecondary, marginTop: 6, letterSpacing: 1.5, textTransform: 'uppercase' },
  divider: { width: 50, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginTop: 18 },

  form: {
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, padding: 24,
  },
  formTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },

  field: { marginBottom: 16 },
  fieldLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, height: 50, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, color: colors.text, fontSize: 15 },
  eyeBtn: { padding: 4 },

  btn: {
    backgroundColor: colors.primary, borderRadius: 12, height: 52,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.black, fontSize: 16, fontWeight: '800', letterSpacing: 2 },

  footer: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 40 },
});
