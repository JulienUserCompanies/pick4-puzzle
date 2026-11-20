import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProgress } from '../storage/ProgressContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { progress, setSoundEnabled, setHapticsEnabled, resetProgress } = useProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);

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

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sound effects</Text>
          <Switch
            value={progress.soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#2a2a42', true: '#5b6cff' }}
            thumbColor="#ffffff"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Haptics</Text>
          <Switch
            value={progress.hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: '#2a2a42', true: '#5b6cff' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.dangerRow} onPress={handleReset}>
          <Text style={styles.dangerText}>Reset all progress</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.aboutText}>Pick 4 — v1.0.0 (MVP)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1b2f',
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
    color: '#e8e8f5',
    fontSize: 22,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#2a2a42',
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
    color: '#e8e8f5',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dangerText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    color: '#8a8aa3',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
