import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../storage/AuthContext';
import { GradientButton } from '../components/GradientButton';
import { colors, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

type Mode = 'signIn' | 'signUp';

export default function AuthScreen({ navigation }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = mode === 'signUp' ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigation.goBack();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Back">
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{mode === 'signUp' ? 'Create an account' : 'Welcome back'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'signUp'
              ? 'Your current progress will carry over automatically.'
              : 'Sign in to sync your progress across devices.'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.inkMuted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.inkMuted}
            secureTextEntry
            autoComplete={mode === 'signUp' ? 'new-password' : 'password'}
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {submitting ? (
            <ActivityIndicator color={colors.orange} style={{ marginTop: 8 }} />
          ) : (
            <GradientButton
              label={mode === 'signUp' ? 'Create account' : 'Sign in'}
              onPress={handleSubmit}
              style={{ marginTop: 8, width: '100%' }}
              glow={false}
            />
          )}

          <Pressable
            style={styles.switchModeButton}
            onPress={() => {
              setError(null);
              setMode((m) => (m === 'signUp' ? 'signIn' : 'signUp'));
            }}
          >
            <Text style={styles.switchModeText}>
              {mode === 'signUp' ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </Text>
          </Pressable>

          <Pressable style={styles.guestButton} onPress={() => navigation.goBack()}>
            <Text style={styles.guestButtonText}>Continue as guest</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backArrow: {
    color: colors.ink,
    fontSize: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.inkFaint,
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.ink,
    fontSize: 16,
    marginBottom: 12,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '700',
  },
  guestButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  guestButtonText: {
    color: colors.inkFaint,
    fontSize: 14,
    fontWeight: '600',
  },
});
