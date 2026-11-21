import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { BottomNav, NavTab } from '../components/BottomNav';
import { useProgress } from '../storage/ProgressContext';
import { colors, radii, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Statistics'>;

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

export default function StatisticsScreen({ navigation }: Props) {
  const { progress } = useProgress();

  const starsByLevel = progress.starsByLevel;
  const levelsCompleted = Object.keys(starsByLevel).length;
  const totalStars = Object.values(starsByLevel).reduce((a, b) => a + b, 0);
  const perfectLevels = Object.values(starsByLevel).filter((s) => s === 3).length;
  const totalPoints = totalStars * 20;

  function onNavigate(tab: NavTab) {
    navigation.navigate(tab);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Your progress so far</Text>
      </View>

      <View style={styles.grid}>
        <StatCard emoji="🧩" label="Levels completed" value={String(levelsCompleted)} />
        <StatCard emoji="⭐" label="Total stars" value={String(totalStars)} />
        <StatCard emoji="🌟" label="Perfect clears" value={String(perfectLevels)} />
        <StatCard emoji="🪙" label="Points earned" value={String(totalPoints)} />
      </View>

      <View style={styles.navWrap}>
        <BottomNav active="Statistics" onNavigate={onNavigate} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 18,
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.inkFaint,
    fontSize: 13,
    marginTop: 2,
  },
  grid: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignContent: 'flex-start',
  },
  card: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    ...shadows.soft,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
  },
  cardLabel: {
    color: colors.inkFaint,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  navWrap: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
});
