import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../storage/AuthContext';
import { useProgress } from '../storage/ProgressContext';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

export default function AccountScreen({ navigation }: Props) {
  const { user, signOut, deleteAccount } = useAuth();
  const { synced } = useProgress();
  const [deleting, setDeleting] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigation.navigate('Home');
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your account and all synced progress. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const result = await deleteAccount();
            setDeleting(false);
            if (result.error) {
              Alert.alert('Couldn’t delete account', result.error);
            } else {
              navigation.navigate('Home');
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.emailLabel}>Signed in as</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.syncRow}>
          <View style={[styles.syncDot, { backgroundColor: synced ? colors.success : colors.inkMuted }]} />
          <Text style={styles.syncLabel}>{synced ? 'Progress synced' : 'Not synced yet'}</Text>
        </View>
      </View>

      <Pressable style={styles.signOutRow} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <Pressable style={styles.dangerRow} onPress={handleDeleteAccount} disabled={deleting}>
        {deleting ? (
          <ActivityIndicator color={colors.error} />
        ) : (
          <Text style={styles.dangerText}>Delete account</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backArrow: {
    color: colors.ink,
    fontSize: 22,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 20,
    ...shadows.soft,
  },
  emailLabel: {
    color: colors.inkFaint,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  email: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncLabel: {
    color: colors.inkFaint,
    fontSize: 13,
  },
  signOutRow: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    ...shadows.soft,
  },
  signOutText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  dangerRow: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
});
