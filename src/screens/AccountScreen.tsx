import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../storage/AuthContext';
import { useProgress } from '../storage/ProgressContext';

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
          <View style={[styles.syncDot, { backgroundColor: synced ? '#c6ff3d' : '#6b6f67' }]} />
          <Text style={styles.syncLabel}>{synced ? 'Progress synced' : 'Not synced yet'}</Text>
        </View>
      </View>

      <Pressable style={styles.signOutRow} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <Pressable style={styles.dangerRow} onPress={handleDeleteAccount} disabled={deleting}>
        {deleting ? (
          <ActivityIndicator color="#ff9d42" />
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
    backgroundColor: '#0a0a0a',
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
    color: '#f2f2ed',
    fontSize: 22,
  },
  title: {
    color: '#f2f2ed',
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  emailLabel: {
    color: '#6b6f67',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  email: {
    color: '#f2f2ed',
    fontSize: 17,
    fontWeight: '600',
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
    color: '#9a9d95',
    fontSize: 13,
  },
  signOutRow: {
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutText: {
    color: '#f2f2ed',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerRow: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerText: {
    color: '#ff9d42',
    fontSize: 15,
    fontWeight: '600',
  },
});
