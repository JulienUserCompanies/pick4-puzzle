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
            placeholderTextColor="#6b6f67"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6b6f67"
            secureTextEntry
            autoComplete={mode === 'signUp' ? 'new-password' : 'password'}
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.primaryButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <Text style={styles.primaryButtonText}>{mode === 'signUp' ? 'Create account' : 'Sign in'}</Text>
            )}
          </Pressable>

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
    backgroundColor: '#0a0a0a',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backArrow: {
    color: '#f2f2ed',
    fontSize: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: '#f2f2ed',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b6f67',
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f2f2ed',
    fontSize: 16,
    marginBottom: 12,
  },
  error: {
    color: '#ff9d42',
    fontSize: 14,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#c6ff3d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontSize: 17,
    fontWeight: '800',
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#c6ff3d',
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#6b6f67',
    fontSize: 14,
    fontWeight: '600',
  },
});
