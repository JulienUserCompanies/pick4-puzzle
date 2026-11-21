import React from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';
import { useAuth } from '../storage/AuthContext';
import { colors, radii, shadows } from '../theme';

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
            trackColor={{ false: colors.border, true: colors.orange }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptics</Text>
          <Switch
            value={progress.hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: colors.border, true: colors.orange }}
            thumbColor={colors.white}
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
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    ...shadows.soft,
  },
  accountLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  accountSub: {
    color: colors.inkFaint,
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    color: colors.inkFaint,
    fontSize: 22,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    marginBottom: 20,
    overflow: 'hidden',
    ...shadows.soft,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dangerText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  aboutText: {
    color: colors.inkFaint,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
