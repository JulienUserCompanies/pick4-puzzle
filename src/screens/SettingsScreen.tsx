import React from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';
import { useAuth } from '../storage/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { progress, setSoundEnabled, setHapticsEnabled, resetProgress } = useProgress();
  const { user } = useAuth();

  function handleReset() {
    Alert.alert(
      'Reset all progress?',
      'This clears every star and unlocked level. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            navigation.navigate('Home');
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
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <Pressable
        style={styles.accountRow}
        onPress={() => navigation.navigate(user ? 'Account' : 'Auth')}
      >
        <View>
          <Text style={styles.accountLabel}>{user ? 'Account' : 'Guest'}</Text>
          <Text style={styles.accountSub}>
            {user ? user.email : 'Sign in to save your progress across devices'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sound effects</Text>
          <Switch
            value={progress.soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#2a2a28', true: '#c6ff3d' }}
            thumbColor="#f2f2ed"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptics</Text>
          <Switch
            value={progress.hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: '#2a2a28', true: '#c6ff3d' }}
            thumbColor="#f2f2ed"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.dangerRow} onPress={handleReset}>
          <Text style={styles.dangerText}>Reset all progress</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.aboutText}>Pick 4 — v1.0.0</Text>
      </View>
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
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: 'rgba(198,255,61,0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  accountLabel: {
    color: '#f2f2ed',
    fontSize: 16,
    fontWeight: '700',
  },
  accountSub: {
    color: '#9a9d95',
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    color: '#6b6f67',
    fontSize: 22,
  },
  section: {
    backgroundColor: '#131313',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowLabel: {
    color: '#f2f2ed',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dangerText: {
    color: '#ff9d42',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    color: '#6b6f67',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
